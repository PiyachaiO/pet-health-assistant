"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === "veterinarian") {
        return <Navigate to="/vet-dashboard" />
      } else if (user.role === "admin") {
        return <Navigate to="/admin" />
      } else {
        return <Navigate to="/dashboard" />
      }
    }
  }

  return children
}

export default ProtectedRoute
