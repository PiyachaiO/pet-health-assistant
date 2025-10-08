"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import VetApplicationForm from "../components/VetApplicationForm"
import VetApplicationStatus from "../components/VetApplicationStatus"
import { UserPlus, FileText, CheckCircle, Clock } from "lucide-react"

const VetApplicationPage = () => {
  const { user } = useAuth()
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  // ถ้าเป็น veterinarian หรือ admin แล้ว ให้แสดงข้อความ
  if (user?.role === "veterinarian") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">คุณเป็นสัตวแพทย์แล้ว</h1>
              <p className="text-gray-600 mb-6">
                คุณมีสถานะเป็นสัตวแพทย์ในระบบแล้ว สามารถใช้งานฟีเจอร์ต่างๆ ของสัตวแพทย์ได้
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• จัดการการนัดหมาย</p>
                <p>• สร้างแผนโภชนาการ</p>
                <p>• เขียนบทความ</p>
                <p>• ดูข้อมูลสัตว์เลี้ยง</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user?.role === "admin") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <UserPlus className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">คุณเป็นผู้ดูแลระบบ</h1>
              <p className="text-gray-600 mb-6">
                คุณมีสิทธิ์เป็นผู้ดูแลระบบ สามารถจัดการคำขอเป็นสัตวแพทย์ได้ที่หน้าแดชบอร์ด
              </p>
              <a
                href="/admin-dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                ไปยังแดชบอร์ดแอดมิน
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ขอเป็นสัตวแพทย์</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ส่งคำขอเพื่อเป็นสัตวแพทย์ในระบบ Pet Health Assistant 
            และเริ่มให้บริการดูแลสุขภาพสัตว์เลี้ยง
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">สิทธิประโยชน์ของสัตวแพทย์</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">จัดการการนัดหมาย</h3>
                  <p className="text-sm text-gray-600">รับและจัดการการนัดหมายจากเจ้าของสัตว์เลี้ยง</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">สร้างแผนโภชนาการ</h3>
                  <p className="text-sm text-gray-600">ออกแบบและแนะนำแผนโภชนาการสำหรับสัตว์เลี้ยง</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">เขียนบทความ</h3>
                  <p className="text-sm text-gray-600">แบ่งปันความรู้และประสบการณ์ผ่านบทความ</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">ดูข้อมูลสัตว์เลี้ยง</h3>
                  <p className="text-sm text-gray-600">เข้าถึงประวัติสุขภาพและข้อมูลสัตว์เลี้ยง</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อกำหนดการสมัคร</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <p className="text-gray-700">มีใบประกอบวิชาชีพสัตวแพทย์ที่ถูกต้อง</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <p className="text-gray-700">มีประสบการณ์การทำงานในสาขาสัตวแพทย์</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <p className="text-gray-700">ทำงานในสถานพยาบาลสัตว์หรือคลินิกสัตว์เลี้ยง</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">4</span>
              </div>
              <p className="text-gray-700">พร้อมให้บริการและคำแนะนำผ่านระบบออนไลน์</p>
            </div>
          </div>
        </div>

        {/* Application Status */}
        <VetApplicationStatus onRequestNew={() => setShowApplicationForm(true)} />

        {/* Application Form Modal */}
        {showApplicationForm && (
          <VetApplicationForm
            onClose={() => setShowApplicationForm(false)}
            onApplicationSubmitted={(data) => {
              setShowApplicationForm(false)
              // Refresh the status component
              window.location.reload()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default VetApplicationPage
