"use client"

import { useState } from "react"
import apiClient from "../services/api"
import { X, Upload, FileText, User, Building, Award, MessageSquare } from "lucide-react"
import ImageUpload from "./ImageUpload"

const VetApplicationForm = ({ onClose, onApplicationSubmitted }) => {
  const [formData, setFormData] = useState({
    license_number: "",
    experience_years: "",
    workplace: "",
    specialization: "",
    additional_info: "",
    license_document_url: "",
    portfolio_url: "",
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
      // Sanitize form data before submission
      const applicationData = {
        license_number: formData.license_number.trim(),
        experience_years: parseInt(formData.experience_years) || 0,
        workplace: formData.workplace.trim(),
        specialization: formData.specialization.trim() || null,
        additional_info: formData.additional_info.trim() || null,
        license_document_url: formData.license_document_url || null,
        portfolio_url: formData.portfolio_url || null,
      }

      const response = await apiClient.post("/vet-applications", applicationData)
      onApplicationSubmitted(response.data)
      onClose()
    } catch (error) {
      console.error("Vet application submission error:", error)
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการส่งคำขอ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">ขอเป็นสัตวแพทย์</h2>
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

          {/* ข้อมูลใบประกอบวิชาชีพ */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลใบประกอบวิชาชีพ</h3>
            </div>

            <div>
              <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-2">
                หมายเลขใบประกอบวิชาชีพ *
              </label>
              <input
                type="text"
                id="license_number"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="เช่น VET123456"
                required
              />
            </div>

            <div>
              <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
                ประสบการณ์การทำงาน (ปี) *
              </label>
              <input
                type="number"
                id="experience_years"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="เช่น 5"
                required
              />
            </div>
          </div>

          {/* ข้อมูลสถานที่ทำงาน */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลสถานที่ทำงาน</h3>
            </div>

            <div>
              <label htmlFor="workplace" className="block text-sm font-medium text-gray-700 mb-2">
                สถานที่ทำงาน *
              </label>
              <input
                type="text"
                id="workplace"
                name="workplace"
                value={formData.workplace}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="เช่น คลินิกสัตว์เลี้ยง ABC, โรงพยาบาลสัตว์ XYZ"
                required
              />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                ความเชี่ยวชาญพิเศษ
              </label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">เลือกความเชี่ยวชาญ</option>
                <option value="general">ทั่วไป</option>
                <option value="surgery">ศัลยกรรม</option>
                <option value="internal_medicine">อายุรกรรม</option>
                <option value="dermatology">ผิวหนัง</option>
                <option value="cardiology">หัวใจ</option>
                <option value="oncology">มะเร็ง</option>
                <option value="emergency">ฉุกเฉิน</option>
                <option value="exotic">สัตว์แปลก</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* เอกสารประกอบ */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">เอกสารประกอบ</h3>
            </div>

            <div>
              <label htmlFor="license_document_url" className="block text-sm font-medium text-gray-700 mb-2">
                ลิงก์ใบประกอบวิชาชีพ
              </label>
              <input
                type="url"
                id="license_document_url"
                name="license_document_url"
                value={formData.license_document_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/license.pdf"
              />
            </div>

            <div>
              <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-2">
                ลิงก์ Portfolio หรือ CV
              </label>
              <input
                type="url"
                id="portfolio_url"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/portfolio.pdf"
              />
            </div>
          </div>

          {/* ข้อมูลเพิ่มเติม */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลเพิ่มเติม</h3>
            </div>

            <div>
              <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-2">
                ข้อมูลเพิ่มเติม
              </label>
              <textarea
                id="additional_info"
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณาแจ้งข้อมูลเพิ่มเติมที่เกี่ยวข้อง เช่น ประสบการณ์พิเศษ, การศึกษา, ใบรับรองต่างๆ"
              />
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>กำลังส่งคำขอ...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>ส่งคำขอ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VetApplicationForm
