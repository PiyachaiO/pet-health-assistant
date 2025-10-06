"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSocket } from "../contexts/SocketContext"
import { Menu, X, Calendar, Bell, FileText, Utensils, LogOut, PawPrint, Settings, User, Users, Shield, LayoutDashboard } from "lucide-react"

const Navbar = () => {
  const { user, logout } = useAuth()
  const { isConnected, unreadCount } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)

  // Load profile image when user changes
  useEffect(() => {
    if (user?.profile_picture_url) {
      // If it's already a base64 image, use it directly
      if (user.profile_picture_url.startsWith('data:')) {
        setProfileImage(user.profile_picture_url)
      } else {
        // Try to load and convert to base64
        const loadImage = async () => {
          try {
            const filename = user.profile_picture_url.includes('/') ? user.profile_picture_url.split('/').pop() : user.profile_picture_url
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upload/image/${filename}`, {
              mode: 'cors',
              credentials: 'omit'
            })
            if (response.ok) {
              const blob = await response.blob()
              const reader = new FileReader()
              reader.onload = (e) => setProfileImage(e.target.result)
              reader.readAsDataURL(blob)
            } else {
              setProfileImage(null)
            }
          } catch (error) {
            console.error('Failed to load profile image:', error)
            setProfileImage(null)
          }
        }
        loadImage()
      }
    } else {
      setProfileImage(null)
    }
  }, [user?.profile_picture_url])

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  // Navigation items for all users (including guests)
  const navigation = [
    { name: "บทความ", href: "/articles", icon: FileText },
  ]

  // Navigation items for authenticated users based on their role
  const userNavigation = user
    ? [
        // Dashboard - different for each role
        { 
          name: "แดชบอร์ด", 
          href: user.role === "veterinarian" ? "/vet-dashboard" 
               : user.role === "admin" ? "/admin" 
               : "/dashboard", 
          icon: LayoutDashboard 
        },
        
        // Pets - available for user and vet
        ...(user.role !== "admin" 
          ? [{ name: "สัตว์เลี้ยง", href: "/pets", icon: PawPrint }]
          : []
        ),
        
        // Appointments - available for all authenticated users
        { name: "นัดหมาย", href: "/appointments", icon: Calendar },
        
        // Notifications - with badge for unread count
        { 
          name: "แจ้งเตือน", 
          href: "/notifications", 
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null
        },
        
        // Nutrition - available for all authenticated users
        { name: "โภชนาการ", href: "/nutrition", icon: Utensils },
      ]
    : []

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🐾</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Pet Health</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "text-green-700 bg-green-100 ring-1 ring-green-200"
                    : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {user &&
              userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-colors relative ${
                    location.pathname === item.href
                      ? "text-green-700 bg-green-100 ring-1 ring-green-200"
                      : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Socket.IO Connection Status */}
                <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-gray-100" title={isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-600">{isConnected ? 'Online' : 'Offline'}</span>
                </div>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${profileImage ? 'hidden' : 'flex'}`}>
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.full_name}</span>
                    <span className="text-xs text-gray-500">
                      {user.role === "veterinarian" ? "สัตวแพทย์" 
                       : user.role === "admin" ? "ผู้ดูแลระบบ" 
                       : "ผู้ใช้งาน"}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-green-600 font-medium">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="btn-primary">
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-base font-medium ${
                  location.pathname === item.href
                    ? "text-green-700 bg-green-100 ring-1 ring-green-200"
                    : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {user &&
              userNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full text-base font-medium relative ${
                    location.pathname === item.href
                      ? "text-green-700 bg-green-100 ring-1 ring-green-200"
                      : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}

            <div className="border-t border-gray-200 pt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">สวัสดี,</p>
                    <p className="text-base font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.role === "veterinarian" ? "🏥 สัตวแพทย์" 
                       : user.role === "admin" ? "👨‍💼 ผู้ดูแลระบบ" 
                       : "👤 ผู้ใช้งาน"}
                    </p>
                    {/* Connection Status */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-600">{isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium bg-green-500 text-white hover:bg-green-600 rounded-md"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
