"use client"

import { useState, useEffect } from "react"
import apiClient from "../services/api"
import { X, User, PawPrint, Calendar, Utensils, Clock, Target } from "lucide-react"

const VetNutritionForm = ({ onClose, onNutritionAdded }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    pet_id: "",
    species: "",
    age_range: "",
    instructions: "",
    start_date: "",
    end_date: "",
  })
  const [users, setUsers] = useState([])
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingPets, setLoadingPets] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (formData.user_id) {
      fetchPetsByUser(formData.user_id)
    } else {
      setPets([])
      setFormData(prev => ({ ...prev, pet_id: "" }))
    }
  }, [formData.user_id])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiClient.get("/admin/users")
      setUsers(response.data.filter(user => user.role === "user"))
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError("ไม่สามารถโหลดรายชื่อผู้ใช้ได้")
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchPetsByUser = async (userId) => {
    try {
      setLoadingPets(true)
      const response = await apiClient.get(`/pets/user/${userId}`)
      setPets(response.data)
    } catch (error) {
      console.error("Failed to fetch pets:", error)
      setError("ไม่สามารถโหลดรายชื่อสัตว์เลี้ยงได้")
      setPets([])
    } finally {
      setLoadingPets(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // สร้าง nutrition guideline ก่อน
      const guidelineData = {
        species: formData.species,
        age_range: formData.age_range,
        daily_calories: 300, // ค่าเริ่มต้น
        protein_percentage: 25.0, // ค่าเริ่มต้น
        fat_percentage: 15.0, // ค่าเริ่มต้น
        feeding_frequency: 2, // ค่าเริ่มต้น
        instructions: formData.instructions,
      }

      const guidelineResponse = await apiClient.post("/nutrition/guidelines", guidelineData)
      const guidelineId = guidelineResponse.data.id

      // สร้าง pet nutrition plan
      const planData = {
        pet_id: formData.pet_id,
        guideline_id: guidelineId,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        custom_instructions: formData.instructions,
      }

      const planResponse = await apiClient.post("/nutrition/plans", planData)
      
      onNutritionAdded(planResponse.data)
      onClose()
    } catch (error) {
      console.error("Nutrition creation error:", error)
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการสร้างแผนโภชนาการ")
    } finally {
      setLoading(false)
    }
  }

  const selectedUser = users.find(user => user.id === formData.user_id)
  const selectedPet = pets.find(pet => pet.id === formData.pet_id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">สร้างแผนโภชนาการ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* เลือกผู้ใช้และสัตว์เลี้ยง */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">เลือกผู้ใช้และสัตว์เลี้ยง</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกผู้ใช้ *
                </label>
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loadingUsers}
                >
                  <option value="">เลือกผู้ใช้</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <p className="text-sm text-gray-500 mt-1">กำลังโหลด...</p>
                )}
              </div>

              <div>
                <label htmlFor="pet_id" className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกสัตว์เลี้ยง *
                </label>
                <select
                  id="pet_id"
                  name="pet_id"
                  value={formData.pet_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!formData.user_id || loadingPets}
                >
                  <option value="">เลือกสัตว์เลี้ยง</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
                {loadingPets && (
                  <p className="text-sm text-gray-500 mt-1">กำลังโหลด...</p>
                )}
                {!formData.user_id && (
                  <p className="text-sm text-gray-500 mt-1">กรุณาเลือกผู้ใช้ก่อน</p>
                )}
              </div>
            </div>

            {/* แสดงข้อมูลที่เลือก */}
            {selectedUser && selectedPet && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedUser.full_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PawPrint className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedPet.name} ({selectedPet.species})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ข้อมูลโภชนาการ */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลโภชนาการ</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
                  ชนิดสัตว์ *
                </label>
                <select
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">เลือกชนิดสัตว์</option>
                  <option value="dog">สุนัข</option>
                  <option value="cat">แมว</option>
                  <option value="bird">นก</option>
                  <option value="rabbit">กระต่าย</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label htmlFor="age_range" className="block text-sm font-medium text-gray-700 mb-2">
                  ช่วงอายุ *
                </label>
                <select
                  id="age_range"
                  name="age_range"
                  value={formData.age_range}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">เลือกช่วงอายุ</option>
                  <option value="0-6 months">0-6 เดือน</option>
                  <option value="6-12 months">6-12 เดือน</option>
                  <option value="1-2 years">1-2 ปี</option>
                  <option value="2-5 years">2-5 ปี</option>
                  <option value="5+ years">5+ ปี</option>
                </select>
              </div>

            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                คำแนะนำเพิ่มเติม
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="คำแนะนำเพิ่มเติมสำหรับการให้อาหาร..."
              />
            </div>
          </div>

          {/* ระยะเวลาแผน */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">ระยะเวลาแผน</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เริ่มต้น *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่สิ้นสุด (ไม่บังคับ)
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  หากไม่ระบุ จะเป็นแผนระยะยาว
                </p>
              </div>
            </div>
          </div>

          {/* ปุ่มส่งคำขอ */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !formData.user_id || !formData.pet_id}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>กำลังสร้างแผน...</span>
                </>
              ) : (
                <>
                  <Utensils className="h-4 w-4" />
                  <span>สร้างแผนโภชนาการ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VetNutritionForm