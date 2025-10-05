const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { body } = require("express-validator")
const { notifyNutritionPlanCreated } = require("../services/notificationService")

const router = express.Router()

// Get nutrition guidelines (public)
router.get("/guidelines", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("nutrition_guidelines")
      .select(`
        *,
        veterinarian:users!nutrition_guidelines_veterinarian_id_fkey(full_name)
      `)
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "GUIDELINES_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Guidelines fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch nutrition guidelines",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get specific nutrition guideline (public)
router.get("/guidelines/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("nutrition_guidelines")
      .select(`
        *,
        veterinarian:users!nutrition_guidelines_veterinarian_id_fkey(full_name)
      `)
      .eq("id", req.params.id)
      .eq("approval_status", "approved")
      .single()

    if (error) {
      return res.status(404).json({
        error: "Nutrition guideline not found",
        code: "GUIDELINE_NOT_FOUND",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Guideline fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch nutrition guideline",
      code: "INTERNAL_ERROR",
    })
  }
})

// Apply authentication middleware for protected routes
router.use(authenticateToken)

// Get nutrition recommendations for user's pets (owners can read)
router.get("/recommendations", async (req, res) => {
  try {
    console.log('[BE] /nutrition/recommendations', { userId: req.user?.id, role: req.user?.role, pet_id: req.query?.pet_id })
    const query = supabase
      .from("pet_nutrition_plans")
      .select(`
        *,
        pets(user_id, name, species, breed, birth_date, weight),
        guidelines:guideline_id(species, age_range, daily_calories),
        veterinarian:users!pet_nutrition_plans_veterinarian_id_fkey(full_name, email)
      `)
      .order("created_at", { ascending: false })

    // ถ้ามี pet_id ใน query และไม่ใช่ "undefined" หรือ undefined ให้กรองที่ฐานข้อมูลเลย
    if (req.query.pet_id && 
        req.query.pet_id !== 'undefined' && 
        req.query.pet_id !== undefined &&
        req.query.pet_id !== 'null' &&
        req.query.pet_id !== null) {
      query.eq("pet_id", req.query.pet_id)
    }

    const { data, error } = await query

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "RECOMMENDATIONS_FETCH_FAILED",
      })
    }
    
    // ตรวจสอบสิทธิ์การเข้าถึงข้อมูลของ user: เจ้าของเห็นเฉพาะของตัวเอง, vet/admin เห็นทั้งหมด
    let result = data
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      result = data.filter(plan => plan.pets && plan.pets.user_id === req.user.id)
    }

    console.log('[BE] result count:', Array.isArray(result) ? result.length : 'n/a')
    res.json(result)
  } catch (error) {
    console.error("[BE] recommendations error:", error)
    res.status(500).json({
      error: "Failed to fetch nutrition recommendations",
      code: "INTERNAL_ERROR",
    })
  }
})

// Create nutrition recommendation (veterinarian only)
router.post(
  "/recommendations",
  requireRole("veterinarian"),
  validationRules.nutritionRecommendation,
  validateRequest,
  async (req, res) => {
    try {
      // Ensure pet exists
      const { data: pet, error: petError } = await supabase
        .from("pets")
        .select("id")
        .eq("id", req.body.pet_id)
        .single()

      if (petError || !pet) {
        return res.status(404).json({ error: "Pet not found", code: "PET_NOT_FOUND" })
      }

    const recommendationData = {
      ...req.body,
        veterinarian_id: req.user.id,
    }

      const { data, error } = await supabase
        .from("pet_nutrition_plans")
        .insert([recommendationData])
        .select()
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "RECOMMENDATION_CREATION_FAILED",
        })
      }

      // ส่งการแจ้งเตือนถึงเจ้าของสัตว์เลี้ยง
      try {
        const [{ data: petData }, { data: vetData }] = await Promise.all([
          supabase.from("pets").select("user_id, name").eq("id", data.pet_id).single(),
          supabase.from("users").select("full_name").eq("id", req.user.id).single()
        ])

        if (petData && vetData) {
          console.log('[Nutrition Plan Created] Notifying user:', petData.user_id);
          await notifyNutritionPlanCreated(petData.user_id, {
            id: data.id,
            pet_id: data.pet_id,
            pet_name: petData.name,
            vet_name: vetData.full_name,
            custom_instructions: data.custom_instructions
          })
        }
      } catch (notificationError) {
        console.error("Failed to send nutrition plan notification:", notificationError)
      }

      res.status(201).json(data)
  } catch (error) {
    console.error("Recommendation creation error:", error)
    res.status(500).json({
      error: "Failed to create nutrition recommendation",
      code: "INTERNAL_ERROR",
    })
  }
  }
)

// Update nutrition recommendation (veterinarian only; must be owner of record)
router.put(
  "/recommendations/:id",
  [requireRole("veterinarian"), ...validationRules.uuidParam("id"), ...validationRules.nutritionRecommendationUpdate],
  validateRequest,
  async (req, res) => {
    try {
      console.log('[BE] Update plan:', req.params.id, 'by vet:', req.user.id)
      
      // First, check if the plan exists and belongs to the current veterinarian
      const { data: planExists, error: checkError } = await supabase
        .from("pet_nutrition_plans")
        .select("id, veterinarian_id")
        .eq("id", req.params.id)
        .single()

      if (checkError || !planExists) {
        console.log('[BE] Plan not found for update:', req.params.id)
        return res.status(404).json({
          error: "Nutrition plan not found",
          code: "PLAN_NOT_FOUND",
        })
      }

      if (planExists.veterinarian_id !== req.user.id) {
        console.log('[BE] Plan belongs to different vet for update:', planExists.veterinarian_id, 'current vet:', req.user.id)
        return res.status(403).json({
          error: "You can only update plans created by you",
          code: "ACCESS_DENIED",
        })
      }

      // ถ้าไม่มี pet_id ใน request body ให้ใช้ pet_id เดิม
      const updateData = { ...req.body, updated_at: new Date().toISOString() };
      if (!req.body.pet_id) {
        // ดึง pet_id เดิมจากฐานข้อมูล
        const { data: existingPlan } = await supabase
          .from("pet_nutrition_plans")
          .select("pet_id")
          .eq("id", req.params.id)
          .single();
        
        if (existingPlan) {
          updateData.pet_id = existingPlan.pet_id;
        }
      }

      const { data, error } = await supabase
        .from("pet_nutrition_plans")
        .update(updateData)
        .eq("id", req.params.id)
        .select()
        .single()

      if (error) {
        console.error('[BE] Update error:', error)
        return res.status(400).json({
          error: error.message,
          code: "RECOMMENDATION_UPDATE_FAILED",
        })
      }

      console.log('[BE] Successfully updated plan')
      res.json(data)
    } catch (error) {
      console.error("Recommendation update error:", error)
      res.status(500).json({
        error: "Failed to update nutrition recommendation",
        code: "INTERNAL_ERROR",
      })
    }
  }
)

// Toggle nutrition plan status (active/inactive)
router.patch(
  "/recommendations/:id/toggle-status",
  [requireRole("veterinarian"), ...validationRules.uuidParam("id")],
  validateRequest,
  async (req, res) => {
    try {
      console.log('[BE] Toggle status for plan:', req.params.id, 'by vet:', req.user.id)
      
      // First, check if the plan exists (without veterinarian_id filter)
      const { data: planExists, error: checkError } = await supabase
        .from("pet_nutrition_plans")
        .select("id, is_active, veterinarian_id")
        .eq("id", req.params.id)
        .single()

      if (checkError || !planExists) {
        console.log('[BE] Plan not found:', req.params.id)
        return res.status(404).json({
          error: "Nutrition plan not found",
          code: "PLAN_NOT_FOUND",
        })
      }

      // Check if the plan belongs to the current veterinarian
      if (planExists.veterinarian_id !== req.user.id) {
        console.log('[BE] Plan belongs to different vet:', planExists.veterinarian_id, 'current vet:', req.user.id)
        return res.status(403).json({
          error: "You can only toggle plans created by you",
          code: "ACCESS_DENIED",
        })
      }

      // Toggle status
      const newStatus = !planExists.is_active
      console.log('[BE] Toggling status from', planExists.is_active, 'to', newStatus)

      const { data, error } = await supabase
        .from("pet_nutrition_plans")
        .update({ 
          is_active: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", req.params.id)
        .select()
        .single()

      if (error) {
        console.error('[BE] Update error:', error)
        return res.status(400).json({
          error: error.message,
          code: "PLAN_STATUS_UPDATE_FAILED",
        })
      }

      console.log('[BE] Successfully toggled plan status')
      res.json(data)
    } catch (error) {
      console.error("Plan status toggle error:", error)
      res.status(500).json({
        error: "Failed to toggle nutrition plan status",
        code: "INTERNAL_ERROR",
      })
    }
  }
)

// Delete nutrition recommendation (veterinarian only; must be owner of record)
router.delete(
  "/recommendations/:id",
  [requireRole("veterinarian"), ...validationRules.uuidParam("id")],
  validateRequest,
  async (req, res) => {
    try {
      console.log('[BE] Delete plan:', req.params.id, 'by vet:', req.user.id)
      
      // First, check if the plan exists and belongs to the current veterinarian
      const { data: planExists, error: checkError } = await supabase
        .from("pet_nutrition_plans")
        .select("id, veterinarian_id")
        .eq("id", req.params.id)
        .single()

      if (checkError || !planExists) {
        console.log('[BE] Plan not found for deletion:', req.params.id)
        return res.status(404).json({
          error: "Nutrition plan not found",
          code: "PLAN_NOT_FOUND",
        })
      }

      if (planExists.veterinarian_id !== req.user.id) {
        console.log('[BE] Plan belongs to different vet for deletion:', planExists.veterinarian_id, 'current vet:', req.user.id)
        return res.status(403).json({
          error: "You can only delete plans created by you",
          code: "ACCESS_DENIED",
        })
      }

    const { error } = await supabase
      .from("pet_nutrition_plans")
      .delete()
      .eq("id", req.params.id)

    if (error) {
        console.error('[BE] Delete error:', error)
      return res.status(400).json({
        error: error.message,
        code: "RECOMMENDATION_DELETION_FAILED",
      })
    }

      console.log('[BE] Successfully deleted plan')
    res.status(204).send()
  } catch (error) {
    console.error("Recommendation deletion error:", error)
    res.status(500).json({
      error: "Failed to delete nutrition recommendation",
      code: "INTERNAL_ERROR",
    })
  }
  }
)

// Vet-specific recommendation for a pet
router.post("/vet-recommendation", [
    body("pet_id").isUUID().withMessage("Valid pet ID is required"),
    body("custom_instructions").trim().isLength({ min: 10 }).withMessage("Instructions must be at least 10 characters"),
    body("custom_calories").optional().isInt({ min: 0 }).withMessage("Calories must be a positive integer"),
    validateRequest
], async (req, res) => {
    if (req.user.role !== 'veterinarian') {
        return res.status(403).json({ error: "Access denied" });
    }

    const { pet_id, custom_instructions, custom_calories } = req.body;

    try {
        // Check if a plan already exists, update it. Otherwise, create a new one.
        const { data: existingPlan, error: findError } = await supabase
            .from("pet_nutrition_plans")
            .select("id")
            .eq("pet_id", pet_id)
            .single();

        let savedData;

        if (existingPlan) {
            // Update existing plan
            const { data, error } = await supabase
                .from("pet_nutrition_plans")
                .update({ 
                    custom_instructions, 
                    custom_calories,
                    updated_at: new Date().toISOString() 
                })
                .eq("id", existingPlan.id)
                .select()
                .single();
            if (error) throw error;
            savedData = data;
        } else {
            // Create new plan
            const { data, error } = await supabase
                .from("pet_nutrition_plans")
                .insert([{ 
                    pet_id, 
                    custom_instructions, 
                    custom_calories,
                    veterinarian_id: req.user.id,
                    is_active: true // Set as active by default
                }])
                .select()
                .single();
            if (error) throw error;
            savedData = data;
        }

        res.status(201).json(savedData);

    } catch (error) {
        console.error("Vet recommendation save error:", error);
        res.status(500).json({ error: "Failed to save vet recommendation" });
    }
});

// Vet/Admin routes for managing guidelines
router.post("/guidelines", validationRules.nutritionGuidelineCreation, validateRequest, async (req, res) => {
  try {
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }
    
    // เอา title และ description ออกจาก body ก่อนส่งเข้า supabase
    const { title, description, ...guidelineData } = req.body;

    // เพิ่ม vet_id และ status ให้กับข้อมูล
    const dataToInsert = {
      ...guidelineData,
      veterinarian_id: req.user.id,
      approval_status: "pending",
    }
    
    const { data, error } = await supabase
      .from("nutrition_guidelines")
      .insert([dataToInsert])
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "GUIDELINE_CREATION_FAILED",
      })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Guideline creation error:", error)
    res.status(500).json({
      error: "Failed to create nutrition guideline",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update nutrition guideline (vet/admin only)
router.put(
  "/guidelines/:id",
  [...validationRules.uuidParam("id"), ...validationRules.nutritionGuidelineUpdate],
  validateRequest,
  async (req, res) => {
    try {
      if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
        return res.status(403).json({
          error: "Access denied",
          code: "ACCESS_DENIED",
        })
      }
      
      // เอา title และ description ออกจาก body ก่อนส่งเข้า supabase
      const { title, description, ...guidelineData } = req.body;

      const { data, error } = await supabase
        .from("nutrition_guidelines")
        .update({ ...guidelineData, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)
        .eq("veterinarian_id", req.user.id)
        .select()
        .single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "GUIDELINE_UPDATE_FAILED",
        })
      }

      res.json(data)
    } catch (error) {
      console.error("Guideline update error:", error)
      res.status(500).json({
        error: "Failed to update nutrition guideline",
        code: "INTERNAL_ERROR",
      })
    }
  }
)

// Publish nutrition guideline (admin only)
router.patch("/guidelines/:id/publish", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    const { data, error } = await supabase
      .from("nutrition_guidelines")
      .update({ 
        approval_status: "approved",
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", req.params.id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "GUIDELINE_PUBLISH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Guideline publish error:", error)
    res.status(500).json({
      error: "Failed to publish nutrition guideline",
      code: "INTERNAL_ERROR",
    })
  }
})

// Delete nutrition guideline (vet/admin only)
router.delete("/guidelines/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    if (req.user.role !== "veterinarian" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    const { error } = await supabase
      .from("nutrition_guidelines")
      .delete()
      .eq("id", req.params.id)
      .eq("veterinarian_id", req.user.id)

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "GUIDELINE_DELETION_FAILED",
      })
    }

    res.status(204).send()
  } catch (error) {
    console.error("Guideline deletion error:", error)
    res.status(500).json({
      error: "Failed to delete nutrition guideline",
      code: "INTERNAL_ERROR",
    })
  }
})

module.exports = router