const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// GET /api/users/profile - ส่งข้อมูลโปรไฟล์ผู้ใช้กลับเสมอ
router.get("/profile", async (req, res) => {
  const userId = req.user.id
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Supabase error:", error)
      return res.status(400).json({
        error: error.message,
        code: "PROFILE_FETCH_FAILED",
      })
    }

    console.log("User data:", data)
    res.status(200).json({
      success: true,
      user: data
    }) // ส่งข้อมูล user กลับในรูปแบบที่ frontend คาดหวัง
  } catch (error) {
    console.error("Fetch profile error:", error)
    res.status(500).json({
      error: "Failed to fetch profile",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update user profile
router.put(
  "/profile",
  validationRules.userProfileUpdate,
  validateRequest,
  async (req, res) => {
    try {
      const { full_name, phone, address, profile_picture_url } = req.body

      const { data, error } = await supabase
        .from("users")
        .update({ full_name, phone, address, profile_picture_url, updated_at: new Date().toISOString() })
        .eq("id", req.user.id)
        .select()
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "PROFILE_UPDATE_FAILED",
        })
      }

      res.json(data)
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({
        error: "Failed to update profile",
        code: "INTERNAL_ERROR",
      })
    }
  },
)

// GET /api/pets - ส่งข้อมูลสัตว์เลี้ยงกลับเสมอ
router.get("/pets", authenticateToken, async (req, res) => {
  const userId = req.user.id
  try {
    const { data, error } = await supabase.from("pets").select("*").eq("user_id", userId)

    if (error) {
      console.error("Supabase error:", error)
      return res.status(400).json({
        error: error.message,
        code: "PETS_FETCH_FAILED",
      })
    }

    res.status(200).json({ pets: data }) // ส่งข้อมูลสัตว์เลี้ยงกลับเสมอ
  } catch (error) {
    console.error("Fetch pets error:", error)
    res.status(500).json({
      error: "Failed to fetch pets",
      code: "INTERNAL_ERROR",
    })
  }
})

// GET /api/notifications - ส่งข้อมูลการแจ้งเตือนกลับเสมอ
router.get("/notifications", authenticateToken, async (req, res) => {
  const userId = req.user.id
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATIONS_FETCH_FAILED",
      })
    }

    res.status(200).json({ notifications: data }) // ส่งข้อมูลการแจ้งเตือนกลับเสมอ
  } catch (error) {
    console.error("Fetch notifications error:", error)
    res.status(500).json({
      error: "Failed to fetch notifications",
      code: "INTERNAL_ERROR",
    })
  }
})


// GET /api/users/veterinarians - ส่งรายชื่อสัตวแพทย์ทั้งหมด
router.get("/veterinarians", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, profile_picture_url")
      .eq("role", "veterinarian");
    if (error) {
      console.error("Supabase error (veterinarians):", error);
      return res.status(400).json({
        error: error.message,
        code: "VETERINARIANS_FETCH_FAILED",
      });
    }
    res.status(200).json({ veterinarians: data });
  } catch (error) {
    console.error("Fetch veterinarians error:", error);
    res.status(500).json({
      error: "Failed to fetch veterinarians",
      code: "INTERNAL_ERROR",
    });
  }
});

module.exports = router
