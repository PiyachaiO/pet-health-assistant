const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get all notifications for user
router.get("/", async (req, res) => {
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })

    // สำหรับสัตวแพทย์: ดึงการแจ้งเตือนที่เกี่ยวข้องกับสัตวแพทย์
    if (req.user.role === "veterinarian") {
      // ดึงการแจ้งเตือนที่สัตวแพทย์เป็นผู้รับ
      // และการแจ้งเตือนระบบที่เกี่ยวข้องกับสัตวแพทย์
      query = query.or(`user_id.eq.${req.user.id}`)
    } else {
      // สำหรับผู้ใช้ทั่วไป: ดึงการแจ้งเตือนของตัวเอง
      query = query.eq("user_id", req.user.id)
    }

    const { data, error } = await query

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATIONS_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Notifications fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch notifications",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get unread notifications count
router.get("/unread/count", async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id)
      .eq("is_read", false)

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATIONS_COUNT_FAILED",
      })
    }

    res.json({ count })
  } catch (error) {
    console.error("Notifications count error:", error)
    res.status(500).json({
      error: "Failed to get notifications count",
      code: "INTERNAL_ERROR",
    })
  }
})

// Mark notification as read (idempotent)
router.patch("/:id/read", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    // 1) Verify the notification exists and belongs to the current user
    const { data: existing, error: findError } = await supabase
      .from("notifications")
      .select("id,is_read")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single()

    if (findError || !existing) {
      return res.status(404).json({
        error: "Notification not found or access denied",
        code: "NOTIFICATION_NOT_FOUND",
      })
    }

    // 2) If already read, return idempotent success
    if (existing.is_read) {
      return res.json({ id: existing.id, is_read: true, message: "Already read" })
    }

    // 3) Mark as read and return the updated row
    const { data: updated, error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", existing.id)
      .eq("user_id", req.user.id)
      .select()
      .single()

    if (updateError || !updated) {
      return res.status(400).json({
        error: updateError?.message || "Failed to update notification",
        code: "NOTIFICATION_UPDATE_FAILED",
      })
    }

    res.json(updated)
  } catch (error) {
    console.error("Notification read error:", error)
    res.status(500).json({
      error: "Failed to mark notification as read",
      code: "INTERNAL_ERROR",
    })
  }
})

// Mark notification as completed
router.patch("/:id/mark-completed", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_completed: true, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .single()

    if (error) {
      return res.status(404).json({
        error: "Notification not found or update failed",
        code: "NOTIFICATION_COMPLETE_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Notification complete error:", error)
    res.status(500).json({
      error: "Failed to mark notification as completed",
      code: "INTERNAL_ERROR",
    })
  }
})

// Mark all notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({
        is_read: true
      })
      .eq("user_id", req.user.id)
      .eq("is_read", false)
      .select()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATIONS_UPDATE_FAILED",
      })
    }

    // แก้ไข: ลบ .single() ออก เนื่องจากอัปเดตหลายรายการ
    res.json({ message: "All notifications marked as read", count: data.length })
  } catch (error) {
    console.error("Notifications read all error:", error)
    res.status(500).json({
      error: "Failed to mark all notifications as read",
      code: "INTERNAL_ERROR",
    })
  }
})

// Delete notification
router.delete("/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATION_DELETION_FAILED",
      })
    }

    res.status(204).send()
  } catch (error) {
    console.error("Notification deletion error:", error)
    res.status(500).json({
      error: "Failed to delete notification",
      code: "INTERNAL_ERROR",
    })
  }
})

// Delete all notifications
router.delete("/", async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", req.user.id)

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATIONS_DELETION_FAILED",
      })
    }

    res.status(204).send()
  } catch (error) {
    console.error("Notifications deletion error:", error)
    res.status(500).json({
      error: "Failed to delete all notifications",
      code: "INTERNAL_ERROR",
    })
  }
})

// Create notification for new appointment (called from appointments route)
router.post("/appointment", async (req, res) => {
  try {
    const { appointment_id, veterinarian_id, user_id, pet_id, appointment_date, appointment_type } = req.body

    // สร้างการแจ้งเตือนสำหรับเจ้าของสัตว์เลี้ยง
    const userNotification = {
      user_id: user_id,
      pet_id: pet_id,
      notification_type: "appointment_reminder",
      title: "ยืนยันการนัดหมาย",
      message: `การนัดหมายของคุณได้รับการยืนยันแล้ว วันที่ ${new Date(appointment_date).toLocaleDateString('th-TH')}`,
      priority: "medium",
      is_read: false,
      is_completed: false,
      due_date: appointment_date
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert([userNotification])
      .select()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATION_CREATION_FAILED",
      })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Appointment notification creation error:", error)
    res.status(500).json({
      error: "Failed to create appointment notification",
      code: "INTERNAL_ERROR",
    })
  }
})

// Admin routes for creating notifications
router.post("/admin/create", validationRules.notificationCreation, validateRequest, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert([req.body])
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "NOTIFICATION_CREATION_FAILED",
      })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Notification creation error:", error)
    res.status(500).json({
      error: "Failed to create notification",
      code: "INTERNAL_ERROR",
    })
  }
})

module.exports = router