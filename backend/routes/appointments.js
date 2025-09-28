const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Debug endpoint to check appointments data (no auth required)
router.get("/debug/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "DEBUG_FAILED",
      })
    }

    res.json({
      count: data.length,
      appointments: data
    })
  } catch (error) {
    console.error("Debug error:", error)
    res.status(500).json({
      error: "Debug failed",
      code: "INTERNAL_ERROR",
    })
  }
})

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get all appointments for user
router.get("/", async (req, res) => {
  try {
    // 1. ตรวจสอบว่าผู้ใช้งานล็อกอินอยู่หรือไม่
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "User not authenticated",
        code: "UNAUTHENTICATED",
      });
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        appointment_type,
        notes,
        created_at,
        updated_at,
        user:users!fk_appointments_user(id, email, full_name),
        veterinarian:users!fk_appointments_vet(id, email, full_name),
        pets(name, species, breed, color, weight)
      `)
      // 5. กรองข้อมูลเฉพาะของผู้ใช้งานที่ล็อกอินอยู่
      .eq('user_id', req.user.id)
      .order("appointment_date", { ascending: true });

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "APPOINTMENTS_FETCH_FAILED",
      });
    }

    res.json(data);
  } catch (error) {
    // 6. บันทึก log ข้อผิดพลาดที่แท้จริง
    console.error("Appointments fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch appointments",
      code: "INTERNAL_ERROR",
    });
  }
});

// Get all appointments (for vets)
router.get("/vet", async (req, res) => {
  // เพิ่ม header เพื่อป้องกัน cache
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  try {
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    let query = supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        status,
        appointment_type,
        notes,
        created_at,
        updated_at,
        user:users!fk_appointments_user(id, email, full_name),
        veterinarian:users!fk_appointments_vet(id, email, full_name),
        pets(name, species, breed, color, weight)
      `)

    // ถ้าเป็นสัตวแพทย์ ให้ดูเฉพาะนัดหมายของตัวเอง
    // ถ้าเป็นแอดมิน ให้ดูการนัดหมายทั้งหมด
    if (req.user.role === "veterinarian") {
      query = query.eq("veterinarian_id", req.user.id)
    }
    // สำหรับ admin ไม่ต้องกรองตาม veterinarian_id

    // ถ้ามี pet_id ใน query parameter ให้กรองตาม pet_id
    if (req.query.pet_id) {
      query = query.eq("pet_id", req.query.pet_id)
    }

    const { data, error } = await query.order("appointment_date", { ascending: true })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "APPOINTMENTS_FETCH_FAILED",
      })
    }

    console.log('=== VET APPOINTMENTS DEBUG ===');
    console.log('Data fetched:', data);
    console.log('Data length:', data?.length);
    console.log('First appointment:', data?.[0]);
    console.log('============================');

    res.json(data)
  } catch (error) {
    console.error("Vet appointments fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch appointments",
      code: "INTERNAL_ERROR",
    })
  }
})

// Create new appointment
router.post("/", validationRules.appointmentCreation, validateRequest, async (req, res) => {
  try {
    // Backward compatibility: map vet_id -> veterinarian_id if provided
    const { vet_id, ...rest } = req.body || {}
    const appointmentData = {
      ...rest,
      user_id: req.user.id,
      status: "scheduled",
      ...(vet_id ? { veterinarian_id: vet_id } : {}),
    }

    // ถ้าไม่มี veterinarian_id และ user เป็น veterinarian ให้ใส่ตัวเอง
    if (!appointmentData.veterinarian_id && req.user.role === "veterinarian") {
      appointmentData.veterinarian_id = req.user.id
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "APPOINTMENT_CREATION_FAILED",
      })
    }

    // สร้างการแจ้งเตือนอัตโนมัติเมื่อมีการนัดหมายใหม่
    try {
      // สร้างการแจ้งเตือนสำหรับเจ้าของสัตว์เลี้ยง
      await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notifications/appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: data.id,
          veterinarian_id: data.veterinarian_id,
          user_id: data.user_id,
          pet_id: data.pet_id,
          appointment_date: data.appointment_date,
          appointment_type: data.appointment_type
        })
      })

      // สร้างการแจ้งเตือนสำหรับสัตวแพทย์ (ถ้ามี)
      if (data.veterinarian_id) {
        const vetNotification = {
          user_id: data.veterinarian_id,
          pet_id: data.pet_id,
          notification_type: "appointment_reminder",
          title: "นัดหมายใหม่",
          message: `มีนัดหมายใหม่สำหรับ ${data.appointment_type} ในวันที่ ${new Date(data.appointment_date).toLocaleDateString('th-TH')}`,
          priority: "high",
          is_read: false,
          is_completed: false,
          due_date: data.appointment_date
        }

        await supabase
          .from("notifications")
          .insert([vetNotification])
      }
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError)
      // ไม่ return error เพราะการนัดหมายสำเร็จแล้ว
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Appointment creation error:", error)
    res.status(500).json({
      error: "Failed to create appointment",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get specific appointment
router.get("/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        status,
        user:users!fk_appointments_user(id, email),
        veterinarian:users!fk_appointments_vet(id, email),
        pets(name, species, breed)
      `)
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single()

    if (error) {
      return res.status(404).json({
        error: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Appointment fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch appointment",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update appointment
router.put(
  "/:id",
  [...validationRules.uuidParam("id"), ...validationRules.appointmentUpdate],
  validateRequest,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .eq("user_id", req.user.id)
        .select()
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "APPOINTMENT_UPDATE_FAILED",
        })
      }

      res.json(data)
    } catch (error) {
      console.error("Appointment update error:", error)
      res.status(500).json({
        error: "Failed to update appointment",
        code: "INTERNAL_ERROR",
      })
    }
  }
)

// Update appointment status
router.patch("/:id/status", [
  ...validationRules.uuidParam("id"),
  ...validationRules.appointmentStatusUpdate
], validateRequest, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Add logic here to check user permissions if needed (e.g., only vet can confirm)

    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      // .eq("user_id", req.user.id) // Or check veterinarian_id based on role
      .select(`
        id,
        appointment_date,
        status,
        appointment_type,
        user_id,
        veterinarian_id,
        pet_id,
        pets(name, species, breed)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "APPOINTMENT_STATUS_UPDATE_FAILED",
      });
    }

    // สร้างการแจ้งเตือนเมื่อมีการอัปเดตสถานะ
    try {
      const statusText = status === "confirmed" ? "ยืนยันแล้ว" : 
                        status === "completed" ? "เสร็จสิ้น" : 
                        status === "cancelled" ? "ยกเลิก" : status;
      
      const notificationData = {
        user_id: data.user_id,
        pet_id: data.pet_id,
        notification_type: "appointment_reminder",
        title: `อัปเดตสถานะนัดหมาย`,
        message: `นัดหมาย ${data.appointment_type} ของ ${data.pets?.name || 'สัตว์เลี้ยง'} ${statusText} แล้ว`,
        priority: "medium",
        is_read: false,
        is_completed: false,
        due_date: data.appointment_date
      };

      await supabase
        .from("notifications")
        .insert([notificationData]);
    } catch (notificationError) {
      console.error("Failed to create status update notification:", notificationError)
    }

    res.json(data);
  } catch (error) {
    console.error("Appointment status update error:", error);
    res.status(500).json({
      error: "Failed to update appointment status",
      code: "INTERNAL_ERROR",
    });
  }
});

// Delete appointment
router.delete("/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "APPOINTMENT_DELETION_FAILED",
      })
    }

    res.status(204).send()
  } catch (error) {
    console.error("Appointment deletion error:", error)
    res.status(500).json({
      error: "Failed to delete appointment",
      code: "INTERNAL_ERROR",
    })
  }
})

module.exports = router 