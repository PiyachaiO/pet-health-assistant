"use client"

import { useState, useEffect } from "react"
import apiClient from "../services/api"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  User, 
  Building, 
  Award,
  Search,
  Filter,
  Eye,
  Check,
  X
} from "lucide-react"

const AdminVetApplications = () => {
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [statusFilter, currentPage])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      params.append("page", currentPage)
      params.append("limit", 10)

      const response = await apiClient.get(`/vet-applications/admin?${params}`)
      setApplications(response.data.applications || [])
      setTotalPages(response.data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch applications:", error)
      setError("ไม่สามารถโหลดข้อมูลคำขอได้")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/vet-applications/admin/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleApprove = async (adminNotes = "") => {
    if (!selectedApplication) return

    try {
      setActionLoading(true)
      await apiClient.patch(`/vet-applications/${selectedApplication.id}/approve`, {
        admin_notes: adminNotes
      })
      
      setShowApprovalModal(false)
      setSelectedApplication(null)
      await fetchApplications()
      await fetchStats()
    } catch (error) {
      console.error("Failed to approve application:", error)
      setError("ไม่สามารถอนุมัติคำขอได้")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (rejectionReason, adminNotes = "") => {
    if (!selectedApplication) return

    try {
      setActionLoading(true)
      await apiClient.patch(`/vet-applications/${selectedApplication.id}/reject`, {
        rejection_reason: rejectionReason,
        admin_notes: adminNotes
      })
      
      setShowRejectionModal(false)
      setSelectedApplication(null)
      await fetchApplications()
      await fetchStats()
    } catch (error) {
      console.error("Failed to reject application:", error)
      setError("ไม่สามารถปฏิเสธคำขอได้")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        app.user?.full_name?.toLowerCase().includes(searchLower) ||
        app.user?.email?.toLowerCase().includes(searchLower) ||
        app.license_number?.toLowerCase().includes(searchLower) ||
        app.workplace?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (loading && applications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">จัดการคำขอเป็นสัตวแพทย์</h2>
        <div className="text-sm text-gray-600">
          อัปเดตล่าสุด: {new Date().toLocaleString("th-TH")}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">คำขอทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_applications || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">รอการอนุมัติ</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending_applications || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved_applications || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ปฏิเสธ</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected_applications || 0}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อ, อีเมล, หมายเลขใบประกอบวิชาชีพ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกสถานะ</option>
              <option value="pending">รอการอนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            รายการคำขอ ({filteredApplications.length})
          </h3>
        </div>

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {filteredApplications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(application.submitted_at)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">ข้อมูลผู้ขอ</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">ชื่อ:</span> {application.user?.full_name}</p>
                        <p><span className="font-medium">อีเมล:</span> {application.user?.email}</p>
                        <p><span className="font-medium">โทรศัพท์:</span> {application.user?.phone || "ไม่ระบุ"}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">ข้อมูลการขอ</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">หมายเลขใบประกอบวิชาชีพ:</span> {application.license_number}</p>
                        <p><span className="font-medium">ประสบการณ์:</span> {application.experience_years} ปี</p>
                        <p><span className="font-medium">สถานที่ทำงาน:</span> {application.workplace}</p>
                        {application.specialization && (
                          <p><span className="font-medium">ความเชี่ยวชาญ:</span> {application.specialization}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {application.additional_info && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">ข้อมูลเพิ่มเติม</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {application.additional_info}
                      </p>
                    </div>
                  )}

                  {application.rejection_reason && (
                    <div className="mb-4">
                      <h4 className="font-medium text-red-900 mb-2">เหตุผลการปฏิเสธ</h4>
                      <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                        {application.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedApplication(application)
                      // Show details modal or expand view
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>ดูรายละเอียด</span>
                  </button>

                  {application.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowApprovalModal(true)
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>อนุมัติ</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowRejectionModal(true)
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>ปฏิเสธ</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApplications.length === 0 && !loading && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบคำขอ</h3>
            <p className="text-gray-600">ไม่มีคำขอเป็นสัตวแพทย์ที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ก่อนหน้า
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            หน้า {currentPage} จาก {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ถัดไป
          </button>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <ApprovalModal
          application={selectedApplication}
          onApprove={handleApprove}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedApplication(null)
          }}
          loading={actionLoading}
        />
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedApplication && (
        <RejectionModal
          application={selectedApplication}
          onReject={handleReject}
          onClose={() => {
            setShowRejectionModal(false)
            setSelectedApplication(null)
          }}
          loading={actionLoading}
        />
      )}
    </div>
  )
}

// Approval Modal Component
const ApprovalModal = ({ application, onApprove, onClose, loading }) => {
  const [adminNotes, setAdminNotes] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onApprove(adminNotes)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">อนุมัติคำขอ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              คุณกำลังจะอนุมัติคำขอเป็นสัตวแพทย์ของ <strong>{application.user?.full_name}</strong>
            </p>
            <p className="text-sm text-gray-600">
              หมายเลขใบประกอบวิชาชีพ: <strong>{application.license_number}</strong>
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              id="admin_notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </div>

          <div className="flex space-x-3">
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
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังอนุมัติ..." : "อนุมัติ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Rejection Modal Component
const RejectionModal = ({ application, onReject, onClose, loading }) => {
  const [rejectionReason, setRejectionReason] = useState("")
  const [adminNotes, setAdminNotes] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!rejectionReason.trim()) return
    onReject(rejectionReason, adminNotes)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">ปฏิเสธคำขอ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              คุณกำลังจะปฏิเสธคำขอเป็นสัตวแพทย์ของ <strong>{application.user?.full_name}</strong>
            </p>
            <p className="text-sm text-gray-600">
              หมายเลขใบประกอบวิชาชีพ: <strong>{application.license_number}</strong>
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 mb-2">
              เหตุผลการปฏิเสธ *
            </label>
            <textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรุณาระบุเหตุผลการปฏิเสธ..."
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุเพิ่มเติม (ไม่บังคับ)
            </label>
            <textarea
              id="admin_notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !rejectionReason.trim()}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังปฏิเสธ..." : "ปฏิเสธ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminVetApplications
