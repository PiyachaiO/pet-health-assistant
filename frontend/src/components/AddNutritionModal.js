"use client"

import { useState } from "react"
import axios from "axios"
import { X } from "lucide-react"

const AddNutritionModal = ({ onClose, onNutritionAdded }) => {
  const [formData, setFormData] = useState({
    species: "",
    age_range: "",
    daily_calories: "",
    protein_percentage: "",
    fat_percentage: "",
    feeding_frequency: "",
    instructions: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/api/vet/nutrition-guidelines", formData)
      onNutritionAdded(response.data)
    } catch (error) {
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการเพิ่มคำแนะนำ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">เพิ่มคำแนะนำโภชนาการ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
              ชนิดสัตว์ *
            </label>
            <select
              id="species"
              name="species"
              required
              className="form-input"
              value={formData.species}
              onChange={handleChange}
            >
              <option value="">เลือกชนิดสัตว์</option>
              <option value="สุนัข">สุนัข</option>
              <option value="แมว">แมว</option>
              <option value="นก">นก</option>
              <option value="กระต่าย">กระต่าย</option>
              <option value="หนูแฮมสเตอร์">หนูแฮมสเตอร์</option>
            </select>
          </div>

          <div>
            <label htmlFor="age_range" className="block text-sm font-medium text-gray-700 mb-1">
              ช่วงอายุ *
            </label>
            <input
              type="text"
              id="age_range"
              name="age_range"
              required
              className="form-input"
              placeholder="เช่น 0-6 เดือน, 1-7 ปี"
              value={formData.age_range}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="daily_calories" className="block text-sm font-medium text-gray-700 mb-1">
              แคลอรี่ต่อวัน (kcal) *
            </label>
            <input
              type="number"
              id="daily_calories"
              name="daily_calories"
              required
              className="form-input"
              placeholder="300"
              value={formData.daily_calories}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="protein_percentage" className="block text-sm font-medium text-gray-700 mb-1">
                โปรตีน (%) *
              </label>
              <input
                type="number"
                id="protein_percentage"
                name="protein_percentage"
                required
                step="0.1"
                className="form-input"
                placeholder="28"
                value={formData.protein_percentage}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="fat_percentage" className="block text-sm font-medium text-gray-700 mb-1">
                ไขมัน (%) *
              </label>
              <input
                type="number"
                id="fat_percentage"
                name="fat_percentage"
                required
                step="0.1"
                className="form-input"
                placeholder="17"
                value={formData.fat_percentage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="feeding_frequency" className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนมื้อต่อวัน *
            </label>
            <select
              id="feeding_frequency"
              name="feeding_frequency"
              required
              className="form-input"
              value={formData.feeding_frequency}
              onChange={handleChange}
            >
              <option value="">เลือกจำนวนมื้อ</option>
              <option value="1">1 มื้อ</option>
              <option value="2">2 มื้อ</option>
              <option value="3">3 มื้อ</option>
              <option value="4">4 มื้อ</option>
            </select>
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              คำแนะนำเพิ่มเติม
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows="3"
              className="form-input"
              placeholder="คำแนะนำและข้อควรระวัง..."
              value={formData.instructions}
              onChange={handleChange}
            />
          </div>

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
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเพิ่ม..." : "เพิ่มคำแนะนำ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddNutritionModal
