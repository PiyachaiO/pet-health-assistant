"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useLocation, useNavigate } from "react-router-dom"
import { petService } from "../services"
import { useAuth } from "../contexts/AuthContext"
import { useApi } from "../hooks"
import { ArrowLeft, Utensils, Edit, Power, Trash2 } from "lucide-react"
import apiClient from "../services/api"
import VetNutritionForm from "../components/VetNutritionForm"

const NutritionRecommendation = () => {
  const { petId } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [vetRecommendation, setVetRecommendation] = useState(null)
  const [allPlans, setAllPlans] = useState([]) // plans for current pet
  const [overviewPlans, setOverviewPlans] = useState([]) // plans for all pets (overview mode)
  const [showVetForm, setShowVetForm] = useState(false)
  const { loading, execute } = useApi()

  useEffect(() => {
    if (petId) {
      fetchPetData()
      fetchVetRecommendations()
    } else {
      // โหมดภาพรวม: ดึงแผนของสัตว์เลี้ยงทุกตัวของผู้ใช้
      (async () => {
        try {
          const response = await apiClient.get('/nutrition/recommendations')
          const plans = Array.isArray(response.data) ? response.data : []
          setOverviewPlans(plans)
        } catch (e) {
          console.error('Failed to fetch overview nutrition plans:', e)
        }
      })()
    }
  }, [petId])

  const fetchPetData = async () => {
    const result = await execute(
      () => petService.getPet(petId),
      {
        onSuccess: (result) => setPet(result.pet),
        onError: (error) => console.error("Failed to fetch pet data:", error)
      }
    )
  }

  const fetchVetRecommendations = async () => {
    try {
      console.log('[NR] petId:', petId)
      
      // สร้าง URL โดยไม่ส่ง pet_id ถ้าเป็น undefined
      let url = '/nutrition/recommendations'
      if (petId && petId !== 'undefined') {
        url += `?pet_id=${petId}`
      }
      
      const response = await apiClient.get(url)
      console.log('[NR] response:', response.status, response.data)
      const plans = Array.isArray(response.data) ? response.data : []
      setAllPlans(plans)
      
      // อ่าน plan_id จาก query หากมี ให้ set เป็นรายการที่เลือก
      const query = new URLSearchParams(location.search)
      const planId = query.get('plan_id')
      if (planId) {
        const found = plans.find(p => p.id === planId)
        if (found) setVetRecommendation(found)
        else if (plans.length > 0) setVetRecommendation(plans[0])
      } else if (plans.length > 0) {
        setVetRecommendation(plans[0])
      }
    } catch (error) {
      console.error("Failed to fetch vet recommendation:", error)
    }
  }

  // ตัดการใช้งาน AI recommendation ออกตามข้อกำหนดใหม่

  const handleVetRecSaved = (savedRec) => {
    setVetRecommendation(savedRec);
    setShowVetForm(false);
    // Refresh the plans list
    fetchVetRecommendations();
  }

  const handleToggleStatus = async (planId) => {
    try {
      const response = await apiClient.patch(`/nutrition/recommendations/${planId}/toggle-status`);
      // Update the plan in the list
      setAllPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId ? response.data : plan
        )
      );
      // If this is the currently selected plan, update it too
      if (vetRecommendation?.id === planId) {
        setVetRecommendation(response.data);
      }
    } catch (error) {
      console.error("Failed to toggle plan status:", error);
      // Show error message to user
      const errorMessage = error.response?.data?.error || "ไม่สามารถเปลี่ยนสถานะแผนได้";
      alert(errorMessage);
    }
  }

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบแผนโภชนาการนี้?")) {
      return;
    }
    
    try {
      await apiClient.delete(`/nutrition/recommendations/${planId}`);
      // Remove the plan from the list
      setAllPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      // If this was the currently selected plan, clear it
      if (vetRecommendation?.id === planId) {
        setVetRecommendation(null);
      }
    } catch (error) {
      console.error("Failed to delete plan:", error);
      // Show error message to user
      const errorMessage = error.response?.data?.error || "ไม่สามารถลบแผนได้";
      alert(errorMessage);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button (เฉพาะโหมดดูรายตัว) */}
        {petId && (
        <Link
          to={`/pets/${petId}`}
          className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปหน้าสัตว์เลี้ยง</span>
        </Link>
        )}

        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Utensils className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">คำแนะนำโภชนาการ</h1>
              {petId ? (
              <p className="text-gray-600">สำหรับ {pet?.name}</p>
              ) : (
                <p className="text-gray-600">รวมทุกตัวของฉัน</p>
              )}
            </div>
          </div>
        </div>

        {/* โหมดภาพรวม: ไม่มี petId แสดงแผนทั้งหมดของผู้ใช้ */}
        {!petId && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">แผนโภชนาการทั้งหมดของฉัน</h3>
            {overviewPlans.length === 0 ? (
              <p className="text-gray-600">ยังไม่มีแผนโภชนาการ</p>
            ) : (
              <div className="space-y-3">
                {overviewPlans.map(plan => (
                  <div key={plan.id} className="p-4 rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{plan.pets?.name || 'ไม่ทราบชื่อ'}</div>
                      <span className={`text-xs px-2 py-0.5 rounded ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{plan.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>สัตวแพทย์:</strong> {plan.veterinarian?.full_name || 'ไม่ระบุ'}</p>
                      <p><strong>สัตว์เลี้ยง:</strong> {plan.pets?.species} - {plan.pets?.breed || 'ไม่ระบุพันธุ์'}</p>
                    </div>
                    {plan.custom_calories && (
                      <div className="text-sm text-gray-600 mt-1">แคลอรี่/วัน: {plan.custom_calories}</div>
                    )}
                    <div className="mt-3">
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => navigate(`/pets/${plan.pet_id}/nutrition?plan_id=${plan.id}`)}
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* โหมดรายตัว: มี petId จึงแสดง Sidebar รายการแผนของสัตว์เลี้ยงนั้น และรายละเอียดแผนที่เลือก */}
        {petId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">แผนทั้งหมดของ</h3>
            <p className="text-sm text-gray-600 mb-3">{pet?.name || 'สัตว์เลี้ยงนี้'}</p>
            {allPlans.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีแผน</p>
            ) : (
              <div className="space-y-2">
                {allPlans.map(plan => (
                  <div
                    key={plan.id}
                    className={`w-full p-3 rounded border ${vetRecommendation?.id === plan.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                  >
                    <button
                      onClick={() => {
                        setVetRecommendation(plan)
                        navigate({ pathname: `/pets/${petId}/nutrition`, search: `?plan_id=${plan.id}` })
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{plan.is_active ? 'แผนปัจจุบัน' : 'แผนก่อนหน้า'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{plan.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">แคลอรี่/วัน: {plan.custom_calories ?? '-'}</div>
                      <div className="text-xs text-gray-500">เริ่ม: {new Date(plan.start_date).toLocaleDateString('th-TH')}</div>
                    </button>
                    
                    {/* ปุ่มจัดการสำหรับสัตวแพทย์ */}
                    {user?.role === 'veterinarian' && (
                      <div className="flex items-center justify-end space-x-2 mt-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(plan.id);
                          }}
                          className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                            plan.is_active 
                              ? 'text-orange-600 hover:bg-orange-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={plan.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        >
                          <Power size={12} />
                          <span>{plan.is_active ? 'ปิด' : 'เปิด'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                          className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 flex items-center space-x-1"
                          title="ลบแผน"
                        >
                          <Trash2 size={12} />
                          <span>ลบ</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {vetRecommendation ? (
            <div className="card border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">รายละเอียดคำแนะนำจากสัตวแพทย์</h3>
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>สัตว์เลี้ยง:</strong> <span className="font-medium">{vetRecommendation.pets?.name || 'ไม่ระบุ'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>สัตวแพทย์:</strong> <span className="font-medium">{vetRecommendation.veterinarian?.full_name || 'ไม่ระบุ'}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {vetRecommendation.pets?.species} - {vetRecommendation.pets?.breed || 'ไม่ระบุพันธุ์'} | 
                        น้ำหนัก: {vetRecommendation.pets?.weight ? `${vetRecommendation.pets.weight} กก.` : 'ไม่ระบุ'}
                      </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{vetRecommendation.custom_instructions}</p>
                    {vetRecommendation.custom_calories && (
                      <p className="text-gray-700 mt-3">พลังงานแนะนำต่อวัน: <span className="font-medium">{vetRecommendation.custom_calories}</span> kcal</p>
                    )}
                    </div>
                    {user?.role === 'veterinarian' && !showVetForm && (
                    <div className="flex space-x-2">
                        <button onClick={() => setShowVetForm(true)} className="btn-secondary btn-sm">
                            <Edit size={16} />
                        </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card"><p className="text-gray-600">ยังไม่มีแผนที่เลือก</p></div>
                    )}
                </div>
            </div>
        )}

        {/* Vet Form */}
        {user?.role === 'veterinarian' && showVetForm && (
            <VetNutritionForm
                petId={petId || null}
                existingRecommendation={vetRecommendation?.custom_instructions}
                planId={vetRecommendation?.id}
                onSave={handleVetRecSaved}
                onCancel={() => setShowVetForm(false)}
            />
        )}

        {/* ตัดส่วน AI recommendation ออกตามข้อกำหนดใหม่ */}

        {/* Add Vet Recommendation Button */}
        {user?.role === 'veterinarian' && !showVetForm && (
             <div className="text-center mt-8">
                <button onClick={() => setShowVetForm(true)} className="btn-outline">
                    <Edit size={18} className="mr-2" />
                    {petId ? 'เพิ่มคำแนะนำจากสัตวแพทย์' : 'สร้างแผนโภชนาการใหม่'}
                </button>
            </div>
        )}
      </div>
    </div>
  )
}

export default NutritionRecommendation
