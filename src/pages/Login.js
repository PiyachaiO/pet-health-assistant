"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()

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

    const result = await login(formData.email, formData.password)

    if (result.success) {
      // Redirect based on user role
      if (result.user.role === "veterinarian") {
        navigate("/vet-dashboard")
      } else if (result.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-gray-600">เข้าสู่บัญชีของคุณเพื่อดูแลสัตว์เลี้ยง</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input pl-10"
                  placeholder="กรอกอีเมลของคุณ"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              ยังไม่มีบัญชี?{" "}
              <Link to="/register" className="text-green-500 hover:text-green-600 font-medium">
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Account Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">บัญชีทดสอบ:</h3>
          <p className="text-sm text-blue-600">
            อีเมล: admin@pethealthassistant.com
            <br />
            รหัสผ่าน: password
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
