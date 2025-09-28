"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simplified and more robust initial loading logic
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const result = await authService.getProfile();
      if (result.success && result.user) {
        const userData = result.user;
        
        // Skip loading profile image in AuthContext to avoid CORS issues
        // Profile images will be loaded in individual components using Base64
        
        setUser(userData);
      } else {
        console.error("Failed to fetch user profile:", result);
        setUser(null); // Explicitly set user to null on failure
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        const userData = result.user;
        
        // Skip loading profile image in AuthContext to avoid CORS issues
        // Profile images will be loaded in individual components using Base64
        
        setUser(userData);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Login failed",
      };
    } finally {
      setLoading(false);
    }
  }

  const register = async (userData) => {
    try {
      const result = await authService.register(userData)
      if (result.success) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      return {
        success: false,
        error: "Registration failed",
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Also remove the token from localStorage on logout
      localStorage.removeItem("token");
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData)
      if (result.success) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      return {
        success: false,
        error: "Failed to update profile",
      }
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const refreshUser = async () => {
    try {
      await fetchUser()
    } catch (error) {
      console.error("Failed to refresh user:", error)
      // Don't logout user on refresh failure
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    refreshUser,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
