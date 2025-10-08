"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useLocation, useNavigate } from "react-router-dom"
import { petService } from "../services"
import { useAuth } from "../contexts/AuthContext"
import { useApi } from "../hooks"
import { ArrowLeft, Utensils, Edit } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState('current') // current | history | create
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
      const selectFirstByTab = () => {
        if (activeTab === 'history') {
          const firstPrev = plans.find(p => !p.is_active)
          if (firstPrev) return firstPrev
        }
        const firstActive = plans.find(p => p.is_active)
        return firstActive || plans[0]
      }

      if (planId) {
        const found = plans.find(p => p.id === planId)
        if (found) setVetRecommendation(found)
        else if (plans.length > 0) setVetRecommendation(selectFirstByTab())
      } else if (plans.length > 0) {
        setVetRecommendation(selectFirstByTab())
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
        <div className="card mb-4">
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'current', label: 'แผนปัจจุบัน' },
              { key: 'history', label: 'ประวัติ' },
              ...(user?.role === 'veterinarian' ? [{ key: 'create', label: 'สร้างแผนใหม่' }] : []),
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  if (tab.key === 'create') setShowVetForm(true); else setShowVetForm(false)
                  // เลือกแผนตามแท็บ
                  if (tab.key !== 'create' && allPlans.length > 0) {
                    const target = tab.key === 'history' ? allPlans.find(p => !p.is_active) : allPlans.find(p => p.is_active) || allPlans[0]
                    if (target) setVetRecommendation(target)
                  }
                }}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {tab.label}
              </button>
            ))}
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

        {/* โหมดรายตัว: มี petId */}
        {petId && activeTab !== 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar: รายการแผน */}
          <div className="lg:col-span-1 space-y-4">
            {/* แผนปัจจุบัน */}
            {activeTab === 'current' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                แผนปัจจุบัน
              </h3>
              {allPlans.filter(p => p.is_active).length === 0 ? (
                <div className="text-center py-6">
                  <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">ยังไม่มีแผนโภชนาการ</p>
                  {user?.role === 'veterinarian' && (
                    <button onClick={() => setShowVetForm(true)} className="btn-primary btn-sm mt-3">
                      สร้างแผนใหม่
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {allPlans.filter(p => p.is_active).map(plan => (
                    <div
                      key={plan.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        vetRecommendation?.id === plan.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-green-200 hover:border-green-400'
                      }`}
                      onClick={() => {
                        setVetRecommendation(plan)
                        navigate({ pathname: `/pets/${petId}/nutrition`, search: `?plan_id=${plan.id}` })
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                          ✓ กำลังใช้งาน
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>สัตวแพทย์:</strong> {plan.veterinarian?.full_name || 'ไม่ระบุ'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>แคลอรี่/วัน:</strong> {plan.custom_calories || '-'} kcal
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        เริ่ม: {new Date(plan.start_date).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* แผนก่อนหน้า */}
            {activeTab === 'history' && allPlans.filter(p => !p.is_active).length > 0 && (
              <div className="card">
                <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  ประวัติแผนก่อนหน้า ({allPlans.filter(p => !p.is_active).length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allPlans.filter(p => !p.is_active).map(plan => (
                    <div
                      key={plan.id}
                      className={`p-2 rounded border cursor-pointer transition-all ${
                        vetRecommendation?.id === plan.id 
                          ? 'border-gray-400 bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setVetRecommendation(plan)
                        navigate({ pathname: `/pets/${petId}/nutrition`, search: `?plan_id=${plan.id}` })
                      }}
                    >
                      <p className="text-xs text-gray-600">
                        <strong>โดย:</strong> {plan.veterinarian?.full_name || 'ไม่ระบุ'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(plan.start_date).toLocaleDateString('th-TH')} 
                        {plan.end_date && ` - ${new Date(plan.end_date).toLocaleDateString('th-TH')}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content: รายละเอียดแผน */}
          <div className="lg:col-span-2">
            {vetRecommendation ? (
            <div className={`card ${vetRecommendation.is_active ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-400'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        vetRecommendation.is_active ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Utensils className={`h-6 w-6 ${vetRecommendation.is_active ? 'text-green-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {vetRecommendation.is_active ? 'แผนโภชนาการปัจจุบัน' : 'แผนโภชนาการก่อนหน้า'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {vetRecommendation.is_active ? 'กำลังใช้งาน' : 'สิ้นสุดแล้ว'}
                        </p>
                      </div>
                    </div>
                    {user?.role === 'veterinarian' && !showVetForm && vetRecommendation.is_active && (
                      <button onClick={() => setShowVetForm(true)} className="btn-secondary btn-sm flex items-center space-x-1">
                          <Edit size={16} />
                          <span>สร้างแผนใหม่</span>
                      </button>
                    )}
                </div>
                
                {/* ข้อมูลแผน */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">สัตว์เลี้ยง:</span>
                    <span className="text-sm font-medium text-gray-900">{vetRecommendation.pets?.name || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">สัตวแพทย์:</span>
                    <span className="text-sm font-medium text-gray-900">{vetRecommendation.veterinarian?.full_name || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">แคลอรี่/วัน:</span>
                    <span className="text-sm font-medium text-gray-900">{vetRecommendation.custom_calories || '-'} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ระยะเวลา:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(vetRecommendation.start_date).toLocaleDateString('th-TH')}
                      {vetRecommendation.end_date && ` - ${new Date(vetRecommendation.end_date).toLocaleDateString('th-TH')}`}
                    </span>
                  </div>
                </div>

                {/* คำแนะนำโภชนาการ */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">คำแนะนำโภชนาการ:</h4>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{vetRecommendation.custom_instructions}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">เลือกแผนโภชนาการ</h3>
                <p className="text-gray-600">กรุณาเลือกแผนจากรายการด้านซ้าย</p>
              </div>
            )}
                </div>
            </div>
        )}

        {/* Vet Form */}
        {user?.role === 'veterinarian' && showVetForm && (
            <VetNutritionForm
                onClose={() => setShowVetForm(false)}
                onNutritionAdded={handleVetRecSaved}
            />
        )}

        {/* ตัดส่วน AI recommendation ออกตามข้อกำหนดใหม่ */}

        {/* Add Vet Recommendation Button */}
        {user?.role === 'veterinarian' && !showVetForm && (
             <div className="text-center mt-8">
               <button onClick={() => { setActiveTab('create'); setShowVetForm(true) }} className="btn-outline">
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
