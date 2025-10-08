"use client"

import { useState, useEffect } from "react"
import apiClient from "../services/api"
import { Clock, CheckCircle, XCircle, FileText, Calendar, User } from "lucide-react"

const VetApplicationStatus = ({ onRequestNew }) => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchApplicationStatus()
  }, [])

  const fetchApplicationStatus = async () => {
    try {
      const response = await apiClient.get("/vet-applications/status")
      setApplications(response.data.applications || [])
    } catch (error) {
      console.error("Failed to fetch application status:", error)
      setError("ไม่สามารถโหลดสถานะการขอได้")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "รอการอนุมัติ"
      case "approved":
        return "อนุมัติแล้ว"
      case "rejected":
        return "ปฏิเสธ"
      default:
        return "ไม่ทราบสถานะ"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchApplicationStatus}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีการขอเป็นสัตวแพทย์</h3>
          <p className="text-gray-600 mb-4">คุณสามารถส่งคำขอเป็นสัตวแพทย์ได้ที่นี่</p>
          <button
            onClick={onRequestNew}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ขอเป็นสัตวแพทย์
          </button>
        </div>
      </div>
    )
  }

  const latestApplication = applications[0]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">สถานะการขอเป็นสัตวแพทย์</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon(latestApplication.status)}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(latestApplication.status)}`}>
            {getStatusText(latestApplication.status)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* ข้อมูลการขอ */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">หมายเลขใบประกอบวิชาชีพ</p>
              <p className="font-medium text-gray-900">{latestApplication.license_number}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">ประสบการณ์</p>
              <p className="font-medium text-gray-900">{latestApplication.experience_years} ปี</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">วันที่ส่งคำขอ</p>
              <p className="font-medium text-gray-900">{formatDate(latestApplication.submitted_at)}</p>
            </div>
          </div>

          {latestApplication.reviewed_at && (
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">วันที่ตรวจสอบ</p>
                <p className="font-medium text-gray-900">{formatDate(latestApplication.reviewed_at)}</p>
              </div>
            </div>
          )}
        </div>

        {/* ข้อมูลเพิ่มเติม */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">รายละเอียดการขอ</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">สถานที่ทำงาน:</span> {latestApplication.workplace}</p>
            {latestApplication.specialization && (
              <p><span className="font-medium">ความเชี่ยวชาญ:</span> {latestApplication.specialization}</p>
            )}
            {latestApplication.additional_info && (
              <p><span className="font-medium">ข้อมูลเพิ่มเติม:</span> {latestApplication.additional_info}</p>
            )}
          </div>
        </div>

        {/* สถานะและข้อความ */}
        {latestApplication.status === "rejected" && latestApplication.rejection_reason && (
          <div className="border-t pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">เหตุผลการปฏิเสธ</h4>
              <p className="text-red-700">{latestApplication.rejection_reason}</p>
            </div>
          </div>
        )}

        {latestApplication.status === "approved" && (
          <div className="border-t pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">ยินดีด้วย!</h4>
              <p className="text-green-700">คำขอเป็นสัตวแพทย์ของคุณได้รับการอนุมัติแล้ว คุณสามารถใช้งานฟีเจอร์ของสัตวแพทย์ได้แล้ว</p>
            </div>
          </div>
        )}

        {latestApplication.status === "pending" && (
          <div className="border-t pt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">กำลังตรวจสอบ</h4>
              <p className="text-yellow-700">คำขอของคุณกำลังอยู่ในขั้นตอนการตรวจสอบ กรุณารอการแจ้งเตือนจากระบบ</p>
            </div>
          </div>
        )}
      </div>

      {/* ประวัติการขอ */}
      {applications.length > 1 && (
        <div className="border-t pt-4 mt-6">
          <h4 className="font-medium text-gray-900 mb-3">ประวัติการขอ</h4>
          <div className="space-y-2">
            {applications.slice(1).map((application, index) => (
              <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(application.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      คำขอ #{applications.length - index}
                    </p>
                    <p className="text-xs text-gray-600">{formatDate(application.submitted_at)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {getStatusText(application.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ปุ่มดำเนินการ */}
      <div className="border-t pt-4 mt-6">
        {latestApplication.status === "rejected" && (
          <button
            onClick={onRequestNew}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ขอใหม่
          </button>
        )}
        
        {latestApplication.status === "pending" && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">คำขอของคุณกำลังรอการอนุมัติ</p>
            <p className="text-xs text-gray-500">กรุณารอการแจ้งเตือนจากระบบ</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VetApplicationStatus
