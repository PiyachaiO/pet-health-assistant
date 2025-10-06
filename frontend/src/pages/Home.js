"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Bell, BarChart3, Utensils, ArrowRight, Heart, Shield, Clock } from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                🐾 ระบบดูแลสุขภาพสัตว์เลี้ยงที่ครบครัน
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              ดูแลสุขภาพสัตว์เลี้ยงของคุณ
              <span className="text-green-500 block">อย่างเป็นระบบ</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              ไม่พลาดกำหนดการสำคัญ พร้อมคำแนะนำจากสัตวแพทย์มืออาชีพ เพื่อสุขภาพที่ดีของเพื่อนสี่ขาที่คุณรัก
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  เข้าสู่แดชบอร์ด
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    เริ่มต้นใช้งานฟรี
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/articles"
                    className="btn-outline text-lg px-8 py-4 inline-flex items-center justify-center rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
                  >
                    อ่านบทความ
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">ฟีเจอร์เด่นที่จะช่วยคุณ</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">เครื่องมือครบครันสำหรับการดูแลสุขภาพสัตว์เลี้ยงอย่างมืออาชีพ</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Bell className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">แจ้งเตือนอัตโนมัติ</h3>
              <p className="text-gray-600 leading-relaxed">ไม่พลาดกำหนดการฉีดวัคซีน การให้ยา และการตรวจสุขภาพ ด้วยระบบแจ้งเตือนที่ชาญฉลาด</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">ติดตามสุขภาพ</h3>
              <p className="text-gray-600 leading-relaxed">บันทึกและติดตามประวัติสุขภาพสัตว์เลี้ยงอย่างเป็นระบบ พร้อมกราฟแสดงผลที่เข้าใจง่าย</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Utensils className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">คำแนะนำโภชนาการ</h3>
              <p className="text-gray-600 leading-relaxed">รับคำแนะนำด้านอาหารและโภชนาการจากสัตวแพทย์ ที่เหมาะสมกับสัตว์เลี้ยงของคุณ</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Heart className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">ดูแลด้วยใจ</h3>
              <p className="text-gray-600 leading-relaxed">ระบบที่ออกแบบมาเพื่อความรักและการดูแลสัตว์เลี้ยงอย่างครอบคลุม</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-red-200">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">ปลอดภัยและเชื่อถือได้</h3>
              <p className="text-gray-600 leading-relaxed">ข้อมูลของคุณได้รับการปกป้องด้วยระบบความปลอดภัยระดับสูง</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-yellow-200">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-200 transition-colors">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">ใช้งานง่าย 24/7</h3>
              <p className="text-gray-600 leading-relaxed">เข้าถึงข้อมูลสัตว์เลี้ยงของคุณได้ทุกที่ทุกเวลา ผ่านอุปกรณ์ใดก็ได้</p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-500 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">พร้อมเริ่มดูแลสัตว์เลี้ยงของคุณแล้วหรือยัง?</h2>
          <p className="text-xl text-green-100 mb-10 leading-relaxed">เข้าร่วมกับเจ้าของสัตว์เลี้ยงที่เชื่อมั่นในบริการของเรา</p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-green-500 font-semibold px-10 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              สมัครสมาชิกฟรี
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
