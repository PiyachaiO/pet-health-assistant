const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")
const { notifyHealthRecordUpdated } = require("../services/notificationService")

const router = express.Router()

router.use(authenticateToken)

// Get all pets for user
router.get("/", async (req, res) => {
  try {
    let query = supabase
      .from("pets")
      .select(`
        *,
        users!pets_user_id_fkey(full_name, email)
      `)
      .order("created_at", { ascending: false })

    // ถ้าเป็นสัตวแพทย์ ให้ดูสัตว์เลี้ยงทั้งหมด
    // ถ้าเป็นผู้ใช้ทั่วไป ให้ดูเฉพาะสัตว์เลี้ยงของตัวเอง
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id)
    }

    const { data, error } = await query

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "PETS_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Pets fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch pets",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get pets by user ID (for veterinarians)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    // ตรวจสอบสิทธิ์ - เฉพาะสัตวแพทย์และแอดมิน
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Veterinarian or Admin role required.",
        code: "ACCESS_DENIED",
      })
    }

    const { data, error } = await supabase
      .from("pets")
      .select(`
        *,
        users!pets_user_id_fkey(full_name, email)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "PETS_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Pets fetch by user error:", error)
    res.status(500).json({
      error: "Failed to fetch pets by user",
      code: "INTERNAL_ERROR",
    })
  }
})

// Create new pet
router.post("/", validationRules.petCreation, validateRequest, async (req, res) => {
  try {
    const petData = {
      ...req.body,
      user_id: req.user.id,
    }

    const { data, error } = await supabase.from("pets").insert([petData]).select().single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "PET_CREATION_FAILED",
      })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Pet creation error:", error)
    res.status(500).json({
      error: "Failed to create pet",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get specific pet
router.get("/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    let query = supabase
      .from("pets")
      .select("*")
      .eq("id", req.params.id)

    // ถ้าเป็นผู้ใช้ทั่วไป ให้ดูเฉพาะสัตว์เลี้ยงของตัวเอง
    // ถ้าเป็นสัตวแพทย์ ให้ดูสัตว์เลี้ยงทั้งหมด
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id)
    }

    const { data, error } = await query.single()

    if (error) {
      return res.status(404).json({
        error: "Pet not found",
        code: "PET_NOT_FOUND",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Pet fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch pet",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update pet
router.put(
  "/:id",
  [...validationRules.uuidParam("id"), ...validationRules.petUpdate],
  validateRequest,
  async (req, res) => {
    try {
      let query = supabase
        .from("pets")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)

      // ถ้าเป็นผู้ใช้ทั่วไป ให้อัปเดตเฉพาะสัตว์เลี้ยงของตัวเอง
      // ถ้าเป็นสัตวแพทย์ ให้อัปเดตสัตว์เลี้ยงทั้งหมด
      if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
        query = query.eq("user_id", req.user.id)
      }

      const { data, error } = await query.select().single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "PET_UPDATE_FAILED",
        })
      }

      res.json(data)
    } catch (error) {
      console.error("Pet update error:", error)
      res.status(500).json({
        error: "Failed to update pet",
        code: "INTERNAL_ERROR",
      })
    }
  },
)

// Delete pet
router.delete("/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { error } = await supabase.from("pets").delete().eq("id", req.params.id).eq("user_id", req.user.id)

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "PET_DELETION_FAILED",
      })
    }

    res.json({ message: "Pet deleted successfully" })
  } catch (error) {
    console.error("Pet deletion error:", error)
    res.status(500).json({
      error: "Failed to delete pet",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get health records for pet
router.get("/:petId/health-records", validationRules.uuidParam("petId"), validateRequest, async (req, res) => {
  try {
    // Verify pet exists and user has access
    let petQuery = supabase
      .from("pets")
      .select("id")
      .eq("id", req.params.petId)

    // ถ้าเป็นผู้ใช้ทั่วไป ให้ดูเฉพาะสัตว์เลี้ยงของตัวเอง
    // ถ้าเป็นสัตวแพทย์ ให้ดูสัตว์เลี้ยงทั้งหมด
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      petQuery = petQuery.eq("user_id", req.user.id)
    }

    const { data: pet, error: petError } = await petQuery.single()

    if (petError || !pet) {
      return res.status(404).json({
        error: "Pet not found",
        code: "PET_NOT_FOUND",
      })
    }

    const { data, error } = await supabase
      .from("health_records")
      .select(`
        *,
        veterinarian:veterinarian_id(full_name)
      `)
      .eq("pet_id", req.params.petId)
      .order("record_date", { ascending: false })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "HEALTH_RECORDS_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Health records fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch health records",
      code: "INTERNAL_ERROR",
    })
  }
})

// Create health record for pet
router.post(
  "/:petId/health-records",
  [...validationRules.uuidParam("petId"), ...validationRules.healthRecordCreation],
  validateRequest,
  async (req, res) => {
    try {
      // Check if user is veterinarian or pet owner
      let pet
      if (req.user.role === "veterinarian") {
        // Veterinarian can create records for any pet
        const { data: petData, error: petError } = await supabase
          .from("pets")
          .select("id")
          .eq("id", req.params.petId)
          .single()

        if (petError || !petData) {
          return res.status(404).json({
            error: "Pet not found",
            code: "PET_NOT_FOUND",
          })
        }
        pet = petData
      } else {
        // Pet owner can only create records for their own pets
        const { data: petData, error: petError } = await supabase
          .from("pets")
          .select("id")
          .eq("id", req.params.petId)
          .eq("user_id", req.user.id)
          .single()

        if (petError || !petData) {
          return res.status(404).json({
            error: "Pet not found",
            code: "PET_NOT_FOUND",
          })
        }
        pet = petData
      }

      const recordData = {
        ...req.body,
        pet_id: req.params.petId,
        // For veterinarians, force assign to current vet; for owners, allow null or provided ID
        veterinarian_id: req.user.role === "veterinarian" ? req.user.id : (req.body.veterinarian_id || null),
      }

      const { data, error } = await supabase.from("health_records").insert([recordData]).select().single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "HEALTH_RECORD_CREATION_FAILED",
        })
      }

      // ส่งการแจ้งเตือนถึงเจ้าของสัตว์เลี้ยง (เฉพาะกรณีที่สัตวแพทย์เป็นคนสร้าง)
      if (req.user.role === "veterinarian") {
        try {
          const [{ data: petData }, { data: vetData }] = await Promise.all([
            supabase.from("pets").select("user_id, name").eq("id", req.params.petId).single(),
            supabase.from("users").select("full_name").eq("id", req.user.id).single()
          ])

          if (petData && vetData) {
            console.log('[Health Record Created] Notifying user:', petData.user_id);
            await notifyHealthRecordUpdated(petData.user_id, {
              id: data.id,
              pet_id: req.params.petId,
              pet_name: petData.name,
              vet_name: vetData.full_name,
              diagnosis: data.diagnosis || 'ตรวจสุขภาพทั่วไป',
              visit_date: data.visit_date
            })
          }
        } catch (notificationError) {
          console.error("Failed to send health record notification:", notificationError)
        }
      }

      res.status(201).json(data)
    } catch (error) {
      console.error("Health record creation error:", error)
      res.status(500).json({
        error: "Failed to create health record",
        code: "INTERNAL_ERROR",
      })
    }
  },
)

module.exports = router
