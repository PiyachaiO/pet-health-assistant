const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied. Admin role required.",
      code: "ACCESS_DENIED",
    })
  }
  next()
}

// Admin or Vet authorization middleware
const requireAdminOrVet = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "veterinarian") {
    return res.status(403).json({
      error: "Access denied. Admin or Veterinarian role required.",
      code: "ACCESS_DENIED",
    })
  }
  next()
}

// Migration endpoint for adding missing columns (admin only)
router.post("/migrate-users", requireAdmin, async (req, res) => {
  try {
    console.log("Starting users table migration...")
    
    // Check if columns already exist by trying to select them
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("is_active, last_login")
      .limit(1)
    
    let isActiveExists = true
    let lastLoginExists = true
    
    if (testError) {
      console.log("Columns don't exist, need to add them")
      isActiveExists = false
      lastLoginExists = false
    }
    
    // Since we can't use ALTER TABLE directly, we'll provide instructions
    console.log("Migration requires manual SQL execution in Supabase dashboard")
    
    res.json({
      message: "Migration requires manual execution. Please run the following SQL in your Supabase SQL Editor:",
      sql_commands: [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;",
        "UPDATE users SET is_active = true WHERE is_active IS NULL;"
      ],
      instructions: "1. Go to Supabase Dashboard > SQL Editor\n2. Run the SQL commands above\n3. Refresh this page",
      success: true
    })
    
  } catch (error) {
    console.error("Migration failed:", error)
    res.status(500).json({
      error: "Migration failed",
      code: "MIGRATION_FAILED",
    })
  }
})

// Get pending approvals
router.get("/pending-approvals", requireAdmin, async (req, res) => {
  try {
    // Get pending appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        *,
        pet:pets!appointments_pet_id_fkey(name, species, breed),
        user:users!fk_appointments_user(full_name, email, phone),
        veterinarian:users!fk_appointments_vet(full_name)
      `)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })

    if (appointmentsError) {
      return res.status(400).json({
        error: appointmentsError.message,
        code: "APPOINTMENTS_FETCH_FAILED",
      })
    }

    // Get pending nutrition guidelines
    const { data: guidelines, error: guidelinesError } = await supabase
      .from("nutrition_guidelines")
      .select(`
        *,
        veterinarian:users!nutrition_guidelines_veterinarian_id_fkey(full_name)
      `)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })

    if (guidelinesError) {
      return res.status(400).json({
        error: guidelinesError.message,
        code: "GUIDELINES_FETCH_FAILED",
      })
    }

    // Transform appointments data to match frontend expectations
    const transformedAppointments = (appointments || []).map(appointment => ({
      ...appointment,
      owner_name: appointment.user?.full_name || 'ไม่ระบุ',
      pet_name: appointment.pet?.name || 'ไม่ระบุ',
      veterinarian_name: appointment.veterinarian?.full_name || 'ไม่ระบุ',
      created_by_role: appointment.user?.role || 'user'
    }))

    // Transform nutrition guidelines data to match frontend expectations
    const transformedGuidelines = (guidelines || []).map(guideline => ({
      ...guideline,
      species_name: guideline.species,
      breed_name: guideline.breed || null,
      special_instructions: guideline.instructions,
      veterinarian_name: guideline.veterinarian?.full_name || 'ไม่ระบุ'
    }))

    res.json({
      appointments: transformedAppointments,
      nutrition_guidelines: transformedGuidelines,
    })
  } catch (error) {
    console.error("Pending approvals fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch pending approvals",
      code: "INTERNAL_ERROR",
    })
  }
})

// Approve appointment
router.patch("/appointments/:id/approve", requireAdmin, validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { action, rejection_reason } = req.body

    if (action === "reject") {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          approval_status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select(`
          *,
          pet:pets!appointments_pet_id_fkey(name, species, breed),
          user:users!fk_appointments_user(full_name, email, phone),
          veterinarian:users!fk_appointments_vet(full_name)
        `)
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "APPOINTMENT_REJECTION_FAILED",
        })
      }

      res.json({
        message: "Appointment rejected successfully",
        appointment: data,
      })
    } else {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status: "confirmed",
          approval_status: "approved",
          approved_by: req.user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select(`
          *,
          pet:pets!appointments_pet_id_fkey(name, species, breed),
          user:users!fk_appointments_user(full_name, email, phone),
          veterinarian:users!fk_appointments_vet(full_name)
        `)
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "APPOINTMENT_APPROVAL_FAILED",
        })
      }

      res.json({
        message: "Appointment approved successfully",
        appointment: data,
      })
    }
  } catch (error) {
    console.error("Appointment approval error:", error)
    res.status(500).json({
      error: "Failed to process appointment",
      code: "INTERNAL_ERROR",
    })
  }
})

// Reject appointment
router.patch("/appointments/:id/reject", requireAdmin, validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        approval_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select(`
        *,
        pet:pets!appointments_pet_id_fkey(name, species, breed),
        user:users!fk_appointments_user(full_name, email, phone),
        veterinarian:users!fk_appointments_vet(full_name)
      `)
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "APPOINTMENT_REJECTION_FAILED",
      })
    }

    // Optionally: create notification here if notification_type enum is known

    res.json({
      message: "Appointment rejected successfully",
      appointment: data,
    })
  } catch (error) {
    console.error("Appointment rejection error:", error)
    res.status(500).json({
      error: "Failed to reject appointment",
      code: "INTERNAL_ERROR",
    })
  }
})

// Approve nutrition guideline
router.patch("/nutrition-guidelines/:id/approve", requireAdmin, validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { action, rejection_reason } = req.body

    if (action === "reject") {
      const { data, error } = await supabase
        .from("nutrition_guidelines")
        .update({
          approval_status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select(`
          *,
          veterinarian:users!nutrition_guidelines_veterinarian_id_fkey(full_name)
        `)
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "GUIDELINE_REJECTION_FAILED",
        })
      }

      res.json({
        message: "Nutrition guideline rejected successfully",
        guideline: data,
      })
    } else {
      const { data, error } = await supabase
        .from("nutrition_guidelines")
        .update({
          approval_status: "approved",
          approved_by: req.user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select(`
          *,
          veterinarian:users!nutrition_guidelines_veterinarian_id_fkey(full_name)
        `)
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "GUIDELINE_APPROVAL_FAILED",
        })
      }

      res.json({
        message: "Nutrition guideline approved successfully",
        guideline: data,
      })
    }
  } catch (error) {
    console.error("Guideline approval error:", error)
    res.status(500).json({
      error: "Failed to process nutrition guideline",
      code: "INTERNAL_ERROR",
    })
  }
})

// Reject nutrition guideline
router.patch("/nutrition-guidelines/:id/reject", requireAdmin, validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("nutrition_guidelines")
      .update({
        approval_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select(`
        *,
        veterinarian:users!nutrition_guidelines_veterinarian_id_fkey(full_name)
      `)
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "GUIDELINE_REJECTION_FAILED",
      })
    }

    res.json({
      message: "Nutrition guideline rejected successfully",
      guideline: data,
    })
  } catch (error) {
    console.error("Guideline rejection error:", error)
    res.status(500).json({
      error: "Failed to reject nutrition guideline",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get system statistics
router.get("/statistics", requireAdmin, async (req, res) => {
  try {
    // Get user statistics
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      return res.status(400).json({
        error: usersError.message,
        code: "USERS_COUNT_FAILED",
      })
    }

    // Get pet statistics
    const { count: totalPets, error: petsError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })

    if (petsError) {
      return res.status(400).json({
        error: petsError.message,
        code: "PETS_COUNT_FAILED",
      })
    }

    // Get appointment statistics
    const { count: totalAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })

    if (appointmentsError) {
      return res.status(400).json({
        error: appointmentsError.message,
        code: "APPOINTMENTS_COUNT_FAILED",
      })
    }

    // Get pending appointments count (by approval_status)
    const { count: pendingAppointments, error: pendingError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "pending")

    if (pendingError) {
      return res.status(400).json({
        error: pendingError.message,
        code: "PENDING_COUNT_FAILED",
      })
    }

    // Get pending nutrition guidelines count
    const { count: pendingNutritionGuidelines, error: pendingNutritionError } = await supabase
      .from("nutrition_guidelines")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "pending")

    if (pendingNutritionError) {
      return res.status(400).json({
        error: pendingNutritionError.message,
        code: "PENDING_NUTRITION_COUNT_FAILED",
      })
    }

    // Get today's appointments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { count: todayAppointments, error: todayError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("appointment_date", today.toISOString())
      .lt("appointment_date", tomorrow.toISOString())

    if (todayError) {
      return res.status(400).json({
        error: todayError.message,
        code: "TODAY_COUNT_FAILED",
      })
    }

    // Get this month's new users
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)

    const { count: newUsersThisMonth, error: newUsersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonthStart.toISOString())

    if (newUsersError) {
      return res.status(400).json({
        error: newUsersError.message,
        code: "NEW_USERS_COUNT_FAILED",
      })
    }

    // Get this month's new pets
    const { count: newPetsThisMonth, error: newPetsError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonthStart.toISOString())

    if (newPetsError) {
      return res.status(400).json({
        error: newPetsError.message,
        code: "NEW_PETS_COUNT_FAILED",
      })
    }

    // Get this month's appointments
    const { count: appointmentsThisMonth, error: appointmentsThisMonthError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonthStart.toISOString())

    if (appointmentsThisMonthError) {
      return res.status(400).json({
        error: appointmentsThisMonthError.message,
        code: "APPOINTMENTS_THIS_MONTH_COUNT_FAILED",
      })
    }

    // Get articles count
    const { count: totalArticles, error: articlesError } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })

    if (articlesError) {
      return res.status(400).json({
        error: articlesError.message,
        code: "ARTICLES_COUNT_FAILED",
      })
    }

    // Get user growth data for the last 6 months
    const userGrowthData = []
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      
      const { count: monthUsers, error: monthUsersError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString())
        .lt("created_at", monthEnd.toISOString())
      
      if (!monthUsersError) {
        userGrowthData.push({
          month: months[monthStart.getMonth()],
          users: monthUsers || 0
        })
      }
    }

    res.json({
      total_users: totalUsers,
      total_pets: totalPets,
      total_articles: totalArticles,
      pending_appointments: pendingAppointments,
      pending_nutrition_guidelines: pendingNutritionGuidelines,
      new_users_this_month: newUsersThisMonth,
      new_pets_this_month: newPetsThisMonth,
      appointments_this_month: appointmentsThisMonth,
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        today: todayAppointments,
      },
      users: {
        total: totalUsers,
      },
      pets: {
        total: totalPets,
      },
      user_growth: userGrowthData,
    })
  } catch (error) {
    console.error("Statistics fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch statistics",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get all users (admin or vet can access)
router.get("/users", requireAdminOrVet, async (req, res) => {
  try {
    const { data, error} = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "USERS_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Users fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch users",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get user's pets (for vets to book appointment)
router.get("/users/:userId/pets", requireAdminOrVet, validationRules.uuidParam("userId"), validateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", req.params.userId)
      .order("name", { ascending: true })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "PETS_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("User pets fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch user's pets",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update user role
router.patch("/users/:id/role", requireAdmin, validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { role } = req.body

    if (!["user", "veterinarian", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
        code: "INVALID_ROLE",
      })
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "USER_UPDATE_FAILED",
      })
    }

    res.json({
      message: "User role updated successfully",
      user: data,
    })
  } catch (error) {
    console.error("User role update error:", error)
    res.status(500).json({
      error: "Failed to update user role",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update user status (active/inactive)
router.patch("/users/:id/status", requireAdmin, validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    console.log("=== User Status Update Debug ===")
    console.log("User ID:", req.params.id)
    console.log("Request body:", req.body)
    console.log("User making request:", req.user)

    const { is_active } = req.body

    if (typeof is_active !== 'boolean') {
      console.log("Error: is_active is not boolean:", typeof is_active, is_active)
      return res.status(400).json({
        error: "is_active must be a boolean",
        code: "INVALID_STATUS",
      })
    }

    console.log("Updating user with is_active:", is_active)

    // First, check if is_active column exists
    const { data: userCheck, error: checkError } = await supabase
      .from("users")
      .select("id, is_active")
      .eq("id", req.params.id)
      .single()

    if (checkError && checkError.message.includes("is_active")) {
      console.log("is_active column does not exist, skipping update")
      return res.status(400).json({
        error: "is_active column does not exist in users table. Please run migration first.",
        code: "COLUMN_NOT_EXISTS",
      })
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single()

    if (error) {
      console.log("Supabase error:", error)
      return res.status(400).json({
        error: error.message,
        code: "USER_STATUS_UPDATE_FAILED",
      })
    }

    console.log("Update successful:", data)
    res.json({
      message: "User status updated successfully",
      user: data,
    })
  } catch (error) {
    console.error("User status update error:", error)
    res.status(500).json({
      error: "Failed to update user status",
      code: "INTERNAL_ERROR",
    })
  }
})

module.exports = router 