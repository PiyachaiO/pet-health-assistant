"use client"

import { useState } from "react"
import apiClient from "../services/api"
import { X } from "lucide-react"

const AddHealthRecordModal = ({ petId, petName, onClose, onRecordAdded }) => {
  const [formData, setFormData] = useState({
    record_type: "",
    title: "",
    description: "",
    record_date: new Date().toISOString().split("T")[0],
    next_due_date: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const recordTypes = [
    { value: "vaccination", label: "การฉีดวัคซีน" },
    { value: "medication", label: "การให้ยา" },
    { value: "checkup", label: "การตรวจสุขภาพ" },
    { value: "surgery", label: "การผ่าตัด" },
    { value: "illness", label: "การเจ็บป่วย" },
    { value: "injury", label: "การบาดเจ็บ" },
  ]

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
      const response = await apiClient.post(`/pets/${petId}/health-records`, formData)
      onRecordAdded(response.data)
    } catch (error) {
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการเพิ่มบันทึก")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">เพิ่มบันทึกสุขภาพ - {petName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="record_type" className="block text-sm font-medium text-gray-700 mb-1">
              ประเภทบันทึก *
            </label>
            <select
              id="record_type"
              name="record_type"
              required
              className="form-input"
              value={formData.record_type}
              onChange={handleChange}
            >
              <option value="">เลือกประเภทบันทึก</option>
              {recordTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              หัวข้อ *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="form-input"
              placeholder="เช่น วัคซีนป้องกันพิษสุนัขบ้า"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-input"
              placeholder="รายละเอียดเพิ่มเติม..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="record_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่ทำ *
            </label>
            <input
              type="date"
              id="record_date"
              name="record_date"
              required
              className="form-input"
              value={formData.record_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="next_due_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่ครั้งถัดไป
            </label>
            <input
              type="date"
              id="next_due_date"
              name="next_due_date"
              className="form-input"
              value={formData.next_due_date}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">ระบบจะแจ้งเตือนล่วงหน้าถ้าระบุวันที่นี้</p>
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
              {loading ? "กำลังเพิ่ม..." : "เพิ่มบันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddHealthRecordModal
