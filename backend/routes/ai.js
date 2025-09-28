const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const { supabase } = require("../config/supabase")

const router = express.Router()

router.use(authenticateToken)

// Mock AI Nutrition Recommendation
router.post("/nutrition-recommendation", async (req, res) => {
  const { pet_id } = req.body

  if (!pet_id) {
    return res.status(400).json({ error: "pet_id is required" })
  }

  try {
    // In a real scenario, you would fetch pet details and send them to an AI service.
    // Here, we'll just fetch the pet's name for the mock response.
    const { data: pet, error } = await supabase
      .from("pets")
      .select("name, species, breed, birth_date, weight")
      .eq("id", pet_id)
      .single()

    if (error || !pet) {
      return res.status(404).json({ error: "Pet not found" })
    }

    // Mock AI response based on pet data
    const mockRecommendation = {
      confidence_score: Math.random() * (0.95 - 0.7) + 0.7, // Random score between 70% and 95%
      veterinarian_consultation_needed: Math.random() < 0.3, // 30% chance of needing consultation
      recommendation: `นี่คือคำแนะนำโภชนาการเบื้องต้นสำหรับ ${pet.name} (${pet.species} พันธุ์ ${pet.breed || 'ผสม'}). ควรให้อาหารที่มีโปรตีนสูงและไขมันต่ำ ควบคุมปริมาณแคลอรี่ต่อวัน และแบ่งเป็นมื้อย่อยๆ เพื่อสุขภาพที่ดี`,
      suggested_actions: [
        "เลือกอาหารเม็ดคุณภาพสูงสำหรับสุนัขโต",
        "ให้อาหาร 2 ครั้งต่อวัน ในปริมาณที่เหมาะสมกับน้ำหนัก",
        "หลีกเลี่ยงการให้ขนมที่มีน้ำตาลและไขมันสูง",
        "มีน้ำสะอาดให้ดื่มตลอดเวลา",
      ],
    }

    // Simulate AI processing time
    setTimeout(() => {
      res.json(mockRecommendation)
    }, 1500)
  } catch (err) {
    console.error("AI recommendation error:", err)
    res.status(500).json({ error: "Failed to generate AI recommendation" })
  }
})

module.exports = router