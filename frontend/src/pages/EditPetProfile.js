"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import apiClient from "../services/api"
import { Utensils } from "lucide-react"
import { ArrowLeft, Save } from "lucide-react"

const EditPetProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    birth_date: "",
    gender: "",
    weight: "",
    color: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [vetRecommendation, setVetRecommendation] = useState(null)

  const fetchPetData = useCallback(async () => {
    try {
      const response = await apiClient.get(`/pets/${id}`)
      setPet(response.data)
      setFormData({
        name: response.data.name || "",
        species: response.data.species || "",
        breed: response.data.breed || "",
        birth_date: response.data.birth_date ? new Date(response.data.birth_date).toISOString().split("T")[0] : "",
        gender: response.data.gender || "",
        weight: response.data.weight || "",
        color: response.data.color || "",
      })
      // ดึงคำแนะนำโภชนาการจากสัตวแพทย์สำหรับสัตว์เลี้ยงตัวนี้
      try {
        console.log('[EPP] pet id:', id)
        const recRes = await apiClient.get(`/nutrition/recommendations?pet_id=${id}`)
        console.log('[EPP] response:', recRes.status, recRes.data)
        const plans = Array.isArray(recRes.data) ? recRes.data : []
        if (plans.length > 0) setVetRecommendation(plans[0])
      } catch (e) {
        console.error("Failed to fetch nutrition recommendation:", e)
      }
    } catch (error) {
      console.error("Failed to fetch pet data:", error)
      setError("ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPetData()
  }, [fetchPetData])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      // Convert Thai values to English for backend
      const submitData = {
        ...formData,
        species: convertSpeciesToEnglish(formData.species),
        gender: convertGenderToEnglish(formData.gender)
      }
      
      await apiClient.put(`/pets/${id}`, submitData)
      navigate(`/pets/${id}`)
    } catch (error) {
      console.error("Failed to update pet profile:", error)
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    } finally {
      setSaving(false)
    }
  }

  // Convert Thai species to English
  const convertSpeciesToEnglish = (thaiSpecies) => {
    const speciesMap = {
      'หมา': 'dog',
      'แมว': 'cat',
      'นก': 'bird',
      'กระต่าย': 'rabbit',
      'ปลา': 'other',
      'แฮมสเตอร์': 'other',
      'กิ้งก่า': 'other',
      'เต่า': 'other',
      'อื่นๆ': 'other'
    }
    return speciesMap[thaiSpecies] || 'other'
  }

  // Convert Thai gender to English
  const convertGenderToEnglish = (thaiGender) => {
    const genderMap = {
      'ผู้': 'male',
      'เมีย': 'female',
      'ไม่ระบุ': 'unknown'
    }
    return genderMap[thaiGender] || 'unknown'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error && !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <Link to="/dashboard" className="btn-secondary">
            กลับไปแดชบอร์ด
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/pets/${id}`} className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปโปรไฟล์</span>
        </Link>

        {/* การ์ดคำแนะนำโภชนาการจากสัตวแพทย์ */}
        {vetRecommendation && (
          <div className="card mb-6 border-l-4 border-green-500">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Utensils className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">คำแนะนำโภชนาการจากสัตวแพทย์</h2>
                <p className="text-gray-700 whitespace-pre-line">{vetRecommendation.custom_instructions}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">แก้ไขข้อมูล {pet?.name}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="form-label">ชื่อ</label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="form-input" 
                  required 
                />
              </div>

              {/* Species */}
              <div>
                <label htmlFor="species" className="form-label">ชนิด</label>
                <select 
                  id="species" 
                  name="species" 
                  value={formData.species} 
                  onChange={handleChange} 
                  className="form-select"
                  required
                >
                  <option value="">{formData.species || "เลือกชนิดสัตว์"}</option>
                  <option value="หมา">หมา</option>
                  <option value="แมว">แมว</option>
                  <option value="กระต่าย">กระต่าย</option>
                  <option value="นก">นก</option>
                  <option value="ปลา">ปลา</option>
                  <option value="แฮมสเตอร์">แฮมสเตอร์</option>
                  <option value="กิ้งก่า">กิ้งก่า</option>
                  <option value="เต่า">เต่า</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Breed */}
              <div>
                <label htmlFor="breed" className="form-label">สายพันธุ์</label>
                <input 
                  id="breed" 
                  name="breed" 
                  type="text" 
                  value={formData.breed} 
                  onChange={handleChange} 
                  className="form-input" 
                />
              </div>

              {/* Birth Date */}
              <div>
                <label htmlFor="birth_date" className="form-label">วันเกิด</label>
                <input 
                  id="birth_date" 
                  name="birth_date" 
                  type="date" 
                  value={formData.birth_date} 
                  onChange={handleChange} 
                  className="form-input" 
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="form-label">เพศ</label>
                <select 
                  id="gender" 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="form-select"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="male">ผู้</option>
                  <option value="female">เมีย</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label htmlFor="weight" className="form-label">น้ำหนัก (กก.)</label>
                <input 
                  id="weight" 
                  name="weight" 
                  type="number" 
                  step="0.1" 
                  value={formData.weight} 
                  onChange={handleChange} 
                  className="form-input" 
                />
              </div>

              {/* Color */}
              <div className="md:col-span-2">
                <label htmlFor="color" className="form-label">สี</label>
                <input 
                  id="color" 
                  name="color" 
                  type="text" 
                  value={formData.color} 
                  onChange={handleChange} 
                  className="form-input" 
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link to={`/pets/${id}`} className="btn-secondary">ยกเลิก</Link>
              <button type="submit" className="btn-primary flex items-center space-x-2" disabled={saving}>
                <Save className="h-4 w-4" />
                <span>{saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditPetProfile