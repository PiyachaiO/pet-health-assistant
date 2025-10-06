"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Bell, BarChart3, Utensils, ArrowRight, Heart, Shield, Clock } from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              ดูแลสุขภาพสัตว์เลี้ยงของคุณ
              <span className="text-green-500 block">อย่างเป็นระบบ</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              ไม่พลาดกำหนดการสำคัญ พร้อมคำแนะนำจากสัตวแพทย์มืออาชีพ เพื่อสุขภาพที่ดีของเพื่อนสี่ขาที่คุณรัก
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center">
                  เข้าสู่แดชบอร์ด
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
                  >
                    เริ่มต้นใช้งานฟรี
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/articles"
                    className="btn-outline text-lg px-8 py-3 inline-flex items-center justify-center"
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ฟีเจอร์เด่นที่จะช่วยคุณ</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">เครื่องมือครบครันสำหรับการดูแลสุขภาพสัตว์เลี้ยงอย่างมืออาชีพ</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">แจ้งเตือนอัตโนมัติ</h3>
              <p className="text-gray-600">ไม่พลาดกำหนดการฉีดวัคซีน การให้ยา และการตรวจสุขภาพ ด้วยระบบแจ้งเตือนที่ชาญฉลาด</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ติดตามสุขภาพ</h3>
              <p className="text-gray-600">บันทึกและติดตามประวัติสุขภาพสัตว์เลี้ยงอย่างเป็นระบบ พร้อมกราฟแสดงผลที่เข้าใจง่าย</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">คำแนะนำโภชนาการ</h3>
              <p className="text-gray-600">รับคำแนะนำด้านอาหารและโภชนาการจากสัตวแพทย์ ที่เหมาะสมกับสัตว์เลี้ยงของคุณ</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ดูแลด้วยใจ</h3>
              <p className="text-gray-600">ระบบที่ออกแบบมาเพื่อความรักและการดูแลสัตว์เลี้ยงอย่างครอบคลุม</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ปลอดภัยและเชื่อถือได้</h3>
              <p className="text-gray-600">ข้อมูลของคุณได้รับการปกป้องด้วยระบบความปลอดภัยระดับสูง</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ใช้งานง่าย 24/7</h3>
              <p className="text-gray-600">เข้าถึงข้อมูลสัตว์เลี้ยงของคุณได้ทุกที่ทุกเวลา ผ่านอุปกรณ์ใดก็ได้</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ตัวเลขที่น่าประทับใจ</h2>
            <p className="text-xl text-gray-600">ความไว้วางใจจากเจ้าของสัตว์เลี้ยงทั่วประเทศ</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-green-500 mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">สัตว์เลี้ยงที่ได้รับการดูแล</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">5,000+</div>
              <div className="text-gray-600 font-medium">เจ้าของที่ไว้วางใจ</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-purple-500 mb-2">100+</div>
              <div className="text-gray-600 font-medium">สัตวแพทย์ผู้เชี่ยวชาญ</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">99%</div>
              <div className="text-gray-600 font-medium">ความพึงพอใจ</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">พร้อมเริ่มดูแลสัตว์เลี้ยงของคุณแล้วหรือยัง?</h2>
          <p className="text-xl text-green-100 mb-8">เข้าร่วมกับเจ้าของสัตว์เลี้ยงหลายพันคนที่เชื่อมั่นในบริการของเรา</p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-green-500 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
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
