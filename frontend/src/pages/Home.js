"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Bell, BarChart3, Utensils, ArrowRight, Heart, Shield, Clock, Star, CheckCircle, Users, Calendar, MessageCircle } from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-500 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-500 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm text-green-800 shadow-lg border border-green-300">
                🐾 ระบบดูแลสุขภาพสัตว์เลี้ยงที่ครบครัน
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              ดูแลสุขภาพสัตว์เลี้ยงของคุณ
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 block">อย่างเป็นระบบ</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              ไม่พลาดกำหนดการสำคัญ พร้อมคำแนะนำจากสัตวแพทย์มืออาชีพ เพื่อสุขภาพที่ดีของเพื่อนสี่ขาที่คุณรัก
            </p>
            
            {/* Quick Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>แจ้งเตือนอัตโนมัติ</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>ติดตามสุขภาพ</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>คำแนะนำโภชนาการ</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                <Link to="/dashboard" className="group bg-green-500 hover:bg-green-600 text-white text-lg px-10 py-4 inline-flex items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  เข้าสู่แดชบอร์ด
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group bg-green-500 hover:bg-green-600 text-white text-lg px-10 py-4 inline-flex items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    เริ่มต้นใช้งานฟรี
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/articles"
                    className="group bg-white hover:bg-gray-50 text-gray-700 text-lg px-10 py-4 inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
      <section className="py-24 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">ฟีเจอร์เด่นที่จะช่วยคุณ</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">เครื่องมือครบครันสำหรับการดูแลสุขภาพสัตว์เลี้ยงอย่างมืออาชีพ</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bell className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">แจ้งเตือนอัตโนมัติ</h3>
              <p className="text-gray-600 leading-relaxed text-lg">ไม่พลาดกำหนดการฉีดวัคซีน การให้ยา และการตรวจสุขภาพ ด้วยระบบแจ้งเตือนที่ชาญฉลาด</p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">ติดตามสุขภาพ</h3>
              <p className="text-gray-600 leading-relaxed text-lg">บันทึกและติดตามประวัติสุขภาพสัตว์เลี้ยงอย่างเป็นระบบ พร้อมกราฟแสดงผลที่เข้าใจง่าย</p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Utensils className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">คำแนะนำโภชนาการ</h3>
              <p className="text-gray-600 leading-relaxed text-lg">รับคำแนะนำด้านอาหารและโภชนาการจากสัตวแพทย์ ที่เหมาะสมกับสัตว์เลี้ยงของคุณ</p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">ดูแลด้วยใจ</h3>
              <p className="text-gray-600 leading-relaxed text-lg">ระบบที่ออกแบบมาเพื่อความรักและการดูแลสัตว์เลี้ยงอย่างครอบคลุม</p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-red-200 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">ปลอดภัยและเชื่อถือได้</h3>
              <p className="text-gray-600 leading-relaxed text-lg">ข้อมูลของคุณได้รับการปกป้องด้วยระบบความปลอดภัยระดับสูง</p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-yellow-200 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-10 w-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">ใช้งานง่าย 24/7</h3>
              <p className="text-gray-600 leading-relaxed text-lg">เข้าถึงข้อมูลสัตว์เลี้ยงของคุณได้ทุกที่ทุกเวลา ผ่านอุปกรณ์ใดก็ได้</p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-green-500 via-green-600 to-blue-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">พร้อมเริ่มดูแลสัตว์เลี้ยงของคุณแล้วหรือยัง?</h2>
          <p className="text-xl md:text-2xl text-green-100 mb-12 leading-relaxed">เข้าร่วมกับเจ้าของสัตว์เลี้ยงที่เชื่อมั่นในบริการของเรา</p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center bg-white text-green-600 font-bold px-12 py-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl text-xl transform hover:-translate-y-1"
              >
                สมัครสมาชิกฟรี
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/articles"
                className="group inline-flex items-center bg-transparent border-2 border-white text-white font-bold px-12 py-5 rounded-2xl hover:bg-white hover:text-green-600 transition-all duration-300 text-xl transform hover:-translate-y-1"
              >
                ดูบทความ
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
