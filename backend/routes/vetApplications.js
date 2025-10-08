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

// =============================================
// USER ROUTES - สำหรับผู้ใช้ทั่วไป
// =============================================

// POST /api/vet-applications - ส่งคำขอเป็นสัตวแพทย์
router.post("/", validationRules.vetApplicationSubmission, validateRequest, async (req, res) => {
  try {
    const userId = req.user.id
    
    // ตรวจสอบว่า user ยังไม่เป็น veterinarian
    if (req.user.role === "veterinarian") {
      return res.status(400).json({
        error: "You are already a veterinarian",
        code: "ALREADY_VETERINARIAN",
      })
    }
    
    // ตรวจสอบว่ามีคำขอที่รออนุมัติอยู่หรือไม่
    const { data: existingApplication, error: checkError } = await supabase
      .from("vet_applications")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .single()
    
    if (existingApplication) {
      return res.status(400).json({
        error: "You already have a pending veterinarian application",
        code: "PENDING_APPLICATION_EXISTS",
      })
    }
    
    const {
      license_number,
      experience_years,
      workplace,
      specialization,
      additional_info,
      license_document_url,
      portfolio_url
    } = req.body
    
    // สร้างคำขอใหม่
    const { data, error } = await supabase
      .from("vet_applications")
      .insert({
        user_id: userId,
        license_number,
        experience_years,
        workplace,
        specialization,
        additional_info,
        license_document_url,
        portfolio_url,
        status: "pending",
        submitted_at: new Date().toISOString()
      })
      .select(`
        *,
        user:users!vet_applications_user_id_fkey(full_name, email, phone)
      `)
      .single()
    
    if (error) {
      console.error("Vet application creation error:", error)
      console.error("Request body:", req.body)
      console.error("User ID:", userId)
      return res.status(400).json({
        error: error.message,
        code: "VET_APPLICATION_CREATION_FAILED",
        details: error
      })
    }
    
    // ส่ง notification ไปยัง admin
    const notificationData = {
      user_id: null, // จะส่งไปยัง admin ทุกคน
      title: "คำขอเป็นสัตวแพทย์ใหม่",
      message: `${req.user.full_name} ส่งคำขอเป็นสัตวแพทย์`,
      type: "vet_application_submitted",
      related_id: data.id,
      created_at: new Date().toISOString()
    }
    
    // หา admin ทั้งหมด
    const { data: admins } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
    
    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        ...notificationData,
        user_id: admin.id
      }))
      
      await supabase.from("notifications").insert(adminNotifications)
      
      // ส่ง real-time notification
      const io = req.app.get('io')
      if (io) {
        admins.forEach(admin => {
          io.to(`user:${admin.id}`).emit('notification', {
            ...notificationData,
            user_id: admin.id
          })
        })
      }
    }
    
    res.status(201).json({
      message: "Veterinarian application submitted successfully",
      application: data
    })
  } catch (error) {
    console.error("Vet application submission error:", error)
    res.status(500).json({
      error: "Failed to submit veterinarian application",
      code: "INTERNAL_ERROR",
    })
  }
})

// GET /api/vet-applications/status - ดูสถานะการขอของตัวเอง
router.get("/status", async (req, res) => {
  try {
    const userId = req.user.id
    
    const { data, error } = await supabase
      .from("vet_applications")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })
    
    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "VET_APPLICATION_FETCH_FAILED",
      })
    }
    
    res.json({
      applications: data,
      current_status: data.length > 0 ? data[0].status : "not_requested"
    })
  } catch (error) {
    console.error("Vet application status fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch veterinarian application status",
      code: "INTERNAL_ERROR",
    })
  }
})

// PUT /api/vet-applications/:id - อัปเดตคำขอ (เฉพาะที่ยัง pending)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // ตรวจสอบว่าเป็นเจ้าของคำขอ
    const { data: existingApplication, error: checkError } = await supabase
      .from("vet_applications")
      .select("id, status, user_id")
      .eq("id", id)
      .single()
    
    if (checkError || !existingApplication) {
      return res.status(404).json({
        error: "Veterinarian application not found",
        code: "APPLICATION_NOT_FOUND",
      })
    }
    
    if (existingApplication.user_id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only update your own applications.",
        code: "ACCESS_DENIED",
      })
    }
    
    if (existingApplication.status !== "pending") {
      return res.status(400).json({
        error: "Cannot update application that is not pending",
        code: "APPLICATION_NOT_PENDING",
      })
    }
    
    const {
      license_number,
      experience_years,
      workplace,
      specialization,
      additional_info,
      license_document_url,
      portfolio_url
    } = req.body
    
    const { data, error } = await supabase
      .from("vet_applications")
      .update({
        license_number,
        experience_years,
        workplace,
        specialization,
        additional_info,
        license_document_url,
        portfolio_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "VET_APPLICATION_UPDATE_FAILED",
      })
    }
    
    res.json({
      message: "Veterinarian application updated successfully",
      application: data
    })
  } catch (error) {
    console.error("Vet application update error:", error)
    res.status(500).json({
      error: "Failed to update veterinarian application",
      code: "INTERNAL_ERROR",
    })
  }
})

// DELETE /api/vet-applications/:id - ยกเลิกคำขอ (เฉพาะที่ยัง pending)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // ตรวจสอบว่าเป็นเจ้าของคำขอ
    const { data: existingApplication, error: checkError } = await supabase
      .from("vet_applications")
      .select("id, status, user_id")
      .eq("id", id)
      .single()
    
    if (checkError || !existingApplication) {
      return res.status(404).json({
        error: "Veterinarian application not found",
        code: "APPLICATION_NOT_FOUND",
      })
    }
    
    if (existingApplication.user_id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own applications.",
        code: "ACCESS_DENIED",
      })
    }
    
    if (existingApplication.status !== "pending") {
      return res.status(400).json({
        error: "Cannot delete application that is not pending",
        code: "APPLICATION_NOT_PENDING",
      })
    }
    
    const { error } = await supabase
      .from("vet_applications")
      .delete()
      .eq("id", id)
    
    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "VET_APPLICATION_DELETE_FAILED",
      })
    }
    
    res.json({
      message: "Veterinarian application cancelled successfully"
    })
  } catch (error) {
    console.error("Vet application delete error:", error)
    res.status(500).json({
      error: "Failed to cancel veterinarian application",
      code: "INTERNAL_ERROR",
    })
  }
})

// =============================================
// ADMIN ROUTES - สำหรับผู้ดูแลระบบ
// =============================================

// GET /api/vet-applications/admin - ดูคำขอทั้งหมด (Admin only)
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit
    
    let query = supabase
      .from("vet_applications")
      .select(`
        *,
        user:users!vet_applications_user_id_fkey(full_name, email, phone, created_at),
        reviewer:users!vet_applications_reviewed_by_fkey(full_name)
      `)
      .order("submitted_at", { ascending: false })
    
    if (status) {
      query = query.eq("status", status)
    }
    
    if (limit && limit !== 'all') {
      query = query.range(offset, offset + limit - 1)
    }
    
    const { data, error } = await query
    
    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "VET_APPLICATIONS_FETCH_FAILED",
      })
    }
    
    // นับจำนวนทั้งหมด
    let countQuery = supabase
      .from("vet_applications")
      .select("*", { count: "exact", head: true })
    
    if (status) {
      countQuery = countQuery.eq("status", status)
    }
    
    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error("Count error:", countError)
    }
    
    res.json({
      applications: data,
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error("Admin vet applications fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch veterinarian applications",
      code: "INTERNAL_ERROR",
    })
  }
})

// PATCH /api/vet-applications/:id/approve - อนุมัติคำขอ (Admin only)
router.patch("/:id/approve", requireAdmin, validationRules.vetApplicationApproval, validateRequest, async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user.id
    const { admin_notes } = req.body
    
    // ตรวจสอบว่าคำขอมีอยู่
    const { data: application, error: fetchError } = await supabase
      .from("vet_applications")
      .select(`
        *,
        user:users!vet_applications_user_id_fkey(id, full_name, email, role)
      `)
      .eq("id", id)
      .single()
    
    if (fetchError || !application) {
      return res.status(404).json({
        error: "Veterinarian application not found",
        code: "APPLICATION_NOT_FOUND",
      })
    }
    
    if (application.status !== "pending") {
      return res.status(400).json({
        error: "Application is not pending",
        code: "APPLICATION_NOT_PENDING",
      })
    }
    
    // อัปเดตสถานะคำขอ
    const { data: updatedApplication, error: updateError } = await supabase
      .from("vet_applications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()
    
    if (updateError) {
      return res.status(400).json({
        error: updateError.message,
        code: "VET_APPLICATION_APPROVAL_FAILED",
      })
    }
    
    // อัปเดต role ของ user เป็น veterinarian
    const { error: roleUpdateError } = await supabase
      .from("users")
      .update({
        role: "veterinarian",
        updated_at: new Date().toISOString()
      })
      .eq("id", application.user_id)
    
    if (roleUpdateError) {
      console.error("Role update error:", roleUpdateError)
      // ไม่ return error เพราะคำขออนุมัติแล้ว
    }
    
    // ส่ง notification ไปยัง user
    const notificationData = {
      user_id: application.user_id,
      title: "คำขอเป็นสัตวแพทย์ได้รับการอนุมัติ",
      message: "ยินดีด้วย! คำขอเป็นสัตวแพทย์ของคุณได้รับการอนุมัติแล้ว",
      type: "vet_application_approved",
      related_id: id,
      created_at: new Date().toISOString()
    }
    
    await supabase.from("notifications").insert(notificationData)
    
    // ส่ง real-time notification
    const io = req.app.get('io')
    if (io) {
      io.to(`user:${application.user_id}`).emit('notification', notificationData)
    }
    
    res.json({
      message: "Veterinarian application approved successfully",
      application: updatedApplication
    })
  } catch (error) {
    console.error("Vet application approval error:", error)
    res.status(500).json({
      error: "Failed to approve veterinarian application",
      code: "INTERNAL_ERROR",
    })
  }
})

// PATCH /api/vet-applications/:id/reject - ปฏิเสธคำขอ (Admin only)
router.patch("/:id/reject", requireAdmin, validationRules.vetApplicationRejection, validateRequest, async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user.id
    const { rejection_reason, admin_notes } = req.body
    
    if (!rejection_reason) {
      return res.status(400).json({
        error: "Rejection reason is required",
        code: "REJECTION_REASON_REQUIRED",
      })
    }
    
    // ตรวจสอบว่าคำขอมีอยู่
    const { data: application, error: fetchError } = await supabase
      .from("vet_applications")
      .select(`
        *,
        user:users!vet_applications_user_id_fkey(id, full_name, email)
      `)
      .eq("id", id)
      .single()
    
    if (fetchError || !application) {
      return res.status(404).json({
        error: "Veterinarian application not found",
        code: "APPLICATION_NOT_FOUND",
      })
    }
    
    if (application.status !== "pending") {
      return res.status(400).json({
        error: "Application is not pending",
        code: "APPLICATION_NOT_PENDING",
      })
    }
    
    // อัปเดตสถานะคำขอ
    const { data: updatedApplication, error: updateError } = await supabase
      .from("vet_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        rejection_reason,
        admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()
    
    if (updateError) {
      return res.status(400).json({
        error: updateError.message,
        code: "VET_APPLICATION_REJECTION_FAILED",
      })
    }
    
    // ส่ง notification ไปยัง user
    const notificationData = {
      user_id: application.user_id,
      title: "คำขอเป็นสัตวแพทย์ถูกปฏิเสธ",
      message: `คำขอเป็นสัตวแพทย์ของคุณถูกปฏิเสธ: ${rejection_reason}`,
      type: "vet_application_rejected",
      related_id: id,
      created_at: new Date().toISOString()
    }
    
    await supabase.from("notifications").insert(notificationData)
    
    // ส่ง real-time notification
    const io = req.app.get('io')
    if (io) {
      io.to(`user:${application.user_id}`).emit('notification', notificationData)
    }
    
    res.json({
      message: "Veterinarian application rejected successfully",
      application: updatedApplication
    })
  } catch (error) {
    console.error("Vet application rejection error:", error)
    res.status(500).json({
      error: "Failed to reject veterinarian application",
      code: "INTERNAL_ERROR",
    })
  }
})

// GET /api/vet-applications/admin/stats - สถิติคำขอ (Admin only)
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    // นับจำนวนคำขอตามสถานะ
    const { count: totalApplications } = await supabase
      .from("vet_applications")
      .select("*", { count: "exact", head: true })
    
    const { count: pendingApplications } = await supabase
      .from("vet_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
    
    const { count: approvedApplications } = await supabase
      .from("vet_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
    
    const { count: rejectedApplications } = await supabase
      .from("vet_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected")
    
    // คำขอในเดือนนี้
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)
    
    const { count: thisMonthApplications } = await supabase
      .from("vet_applications")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", thisMonthStart.toISOString())
    
    res.json({
      total_applications: totalApplications || 0,
      pending_applications: pendingApplications || 0,
      approved_applications: approvedApplications || 0,
      rejected_applications: rejectedApplications || 0,
      this_month_applications: thisMonthApplications || 0
    })
  } catch (error) {
    console.error("Vet applications stats error:", error)
    res.status(500).json({
      error: "Failed to fetch veterinarian applications statistics",
      code: "INTERNAL_ERROR",
    })
  }
})

module.exports = router
