const express = require("express")
const { supabase, supabaseAdmin } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// CORS middleware for auth routes
router.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://frontend-one-ashen-93.vercel.app',
    'https://frontend-nmwrwmfmm-piyachais-projects.vercel.app'
  ]
  
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  next()
})

// Register new user
router.post("/register", validationRules.userRegistration, validateRequest, async (req, res) => {
  try {
    const { email, password, full_name, role = "user", phone, address } = req.body

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
        code: "USER_EXISTS",
      })
    }

    // Create user directly with admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        role,
      },
    })

    if (authError) {
      console.error("Supabase auth error:", authError)
      return res.status(400).json({
        error: authError.message,
        code: "REGISTRATION_FAILED",
      })
    }

    if (!authData.user) {
      return res.status(400).json({
        error: "Failed to create user account",
        code: "USER_CREATION_FAILED",
      })
    }

    // Create user profile in database
    console.log("Creating user profile with ID:", authData.user.id)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email,
          full_name,
          role,
          phone,
          address,
          password_hash: "managed_by_supabase_auth", // Placeholder since password is managed by Supabase Auth
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error("Database error:", userError)
      return res.status(400).json({
        error: userError.message,
        code: "PROFILE_CREATION_FAILED",
      })
    }

    console.log("User profile created successfully:", userData)

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
      access_token: authData.session?.access_token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      error: "Registration failed",
      code: "INTERNAL_ERROR",
    })
  }
})

// Login user
router.post("/login", validationRules.userLogin, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body

    // Use regular auth API for login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "LOGIN_FAILED",
      })
    }

    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (userError) {
      return res.status(400).json({
        error: userError.message,
        code: "PROFILE_FETCH_FAILED",
      })
    }

    res.json({
      message: "Login successful",
      user: userData,
      access_token: data.session.access_token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      error: "Login failed",
      code: "INTERNAL_ERROR",
    })
  }
})

// Logout user
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "LOGOUT_FAILED",
      })
    }

    res.json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      error: "Logout failed",
      code: "INTERNAL_ERROR",
    })
  }
})

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({
        error: "Refresh token required",
        code: "REFRESH_TOKEN_MISSING",
      })
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "REFRESH_FAILED",
      })
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(500).json({
      error: "Token refresh failed",
      code: "INTERNAL_ERROR",
    })
  }
})

// Bypass email confirmation for testing
router.post("/confirm-email", async (req, res) => {
  try {
    const { email } = req.body

    // Get user by email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      return res.status(400).json({
        error: userError.message,
        code: "USER_FETCH_FAILED",
      })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return res.status(400).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    // Confirm email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      return res.status(400).json({
        error: confirmError.message,
        code: "CONFIRMATION_FAILED",
      })
    }

    res.json({
      message: "Email confirmed successfully",
      user_id: user.id,
    })
  } catch (error) {
    console.error("Email confirmation error:", error)
    res.status(500).json({
      error: "Email confirmation failed",
      code: "INTERNAL_ERROR",
    })
  }
})

// Debug endpoint to check users table
router.get("/debug/users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "USERS_FETCH_FAILED",
      })
    }

    res.json({
      message: "Users in database",
      count: data.length,
      users: data,
    })
  } catch (error) {
    console.error("Debug error:", error)
    res.status(500).json({
      error: "Debug failed",
      code: "INTERNAL_ERROR",
    })
  }
})

module.exports = router
