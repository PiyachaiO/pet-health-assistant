"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { register } = useAuth()
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

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      setLoading(false)
      return
    }

    const result = await register({
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    })

    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">สมัครสมาชิก</h2>
          <p className="mt-2 text-gray-600">สร้างบัญชีใหม่เพื่อเริ่มดูแลสัตว์เลี้ยงของคุณ</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="form-input pl-10"
                  placeholder="กรอกชื่อ-นามสกุลของคุณ"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
            </div>

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
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทผู้ใช้งาน
              </label>
              <select id="role" name="role" className="form-input" value={formData.role} onChange={handleChange}>
                <option value="user">เจ้าของสัตว์เลี้ยง</option>
                <option value="veterinarian">สัตวแพทย์</option>
              </select>
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
                  placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              มีบัญชีแล้ว?{" "}
              <Link to="/login" className="text-green-500 hover:text-green-600 font-medium">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
