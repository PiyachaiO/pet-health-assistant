const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { body } = require("express-validator")
const { notifyNutritionPlanCreated } = require("../services/notificationService")

const router = express.Router()

// Apply authentication middleware for all routes
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

// Vet-specific recommendation for a pet (One Active Plan Per Pet)
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
        // 1. Deactivate ALL existing active plans for this pet
        await supabase
            .from("pet_nutrition_plans")
            .update({ 
                is_active: false,
                end_date: new Date().toISOString().split('T')[0], // Set end_date to today
                updated_at: new Date().toISOString() 
            })
            .eq("pet_id", pet_id)
            .eq("is_active", true);

        console.log(`[Nutrition Plan] Deactivated all existing plans for pet: ${pet_id}`);

        // 2. Create new active plan
        const { data: newPlan, error } = await supabase
            .from("pet_nutrition_plans")
            .insert([{ 
                pet_id, 
                custom_instructions, 
                custom_calories,
                veterinarian_id: req.user.id,
                is_active: true,
                start_date: new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();

        if (error) throw error;

        console.log(`[Nutrition Plan] Created new active plan: ${newPlan.id}`);

        // 3. Send notification to pet owner
        try {
            const [{ data: petData }, { data: vetData }] = await Promise.all([
                supabase.from("pets").select("user_id, name").eq("id", pet_id).single(),
                supabase.from("users").select("full_name").eq("id", req.user.id).single()
            ])

            if (petData && vetData) {
                console.log('[Nutrition Plan Created] Notifying user:', petData.user_id);
                await notifyNutritionPlanCreated(petData.user_id, {
                    id: newPlan.id,
                    pet_id: pet_id,
                    pet_name: petData.name,
                    vet_name: vetData.full_name,
                    custom_instructions: custom_instructions
                })
            }
        } catch (notificationError) {
            console.error("Failed to send nutrition plan notification:", notificationError)
        }

        res.status(201).json(newPlan);

    } catch (error) {
        console.error("Vet recommendation save error:", error);
        res.status(500).json({ error: "Failed to save vet recommendation" });
    }
});

module.exports = router
