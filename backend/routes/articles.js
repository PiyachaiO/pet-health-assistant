const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get all articles (public)
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        users!author_id(full_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "ARTICLES_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Articles fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch articles",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get specific article (public)
router.get("/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        users!author_id(full_name)
      `)
      .eq("id", req.params.id)
      .single()

    if (error) {
      return res.status(404).json({
        error: "Article not found",
        code: "ARTICLE_NOT_FOUND",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Article fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch article",
      code: "INTERNAL_ERROR",
    })
  }
})

// Admin/Vet routes (require authentication)
router.use(authenticateToken)

// Get all articles (admin/vet view)
router.get("/admin/all", async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "veterinarian") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    let query = supabase
      .from("articles")
      .select(`
        *,
        users!author_id(full_name)
      `)
      .order("created_at", { ascending: false })

    // ถ้าเป็นสัตวแพทย์ ให้ดูเฉพาะบทความของตัวเอง
    if (req.user.role === "veterinarian") {
      query = query.eq("author_id", req.user.id)
    }

    const { data, error } = await query

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "ARTICLES_FETCH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Admin articles fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch articles",
      code: "INTERNAL_ERROR",
    })
  }
})

// Create new article (admin/vet only)
router.post("/", validationRules.articleCreation, validateRequest, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "veterinarian") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    const articleData = {
      ...req.body,
      author_id: req.user.id,
     
    }

    const { data, error } = await supabase
      .from("articles")
      .insert([articleData])
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "ARTICLE_CREATION_FAILED",
      })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error("Article creation error:", error)
    res.status(500).json({
      error: "Failed to create article",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update article (admin/vet only)
router.put(
  "/:id",
  [...validationRules.uuidParam("id"), ...validationRules.articleUpdate],
  validateRequest,
  async (req, res) => {
    try {
      let query = supabase
        .from("articles")
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq("id", req.params.id)

     // Vets can only update their own articles, Admins can update any.
     if (req.user.role === "veterinarian") {
       query = query.eq("author_id", req.user.id)
     }

     const { data, error } = await query.select().single()

      if (error) {
        return res.status(400).json({
          error: error.message,
          code: "ARTICLE_UPDATE_FAILED",
        })
      }

      res.json(data)
    } catch (error) {
      console.error("Article update error:", error)
      res.status(500).json({
        error: "Failed to update article",
        code: "INTERNAL_ERROR",
      })
    }
  }
)

// Publish article (admin only)
router.patch("/:id/publish", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    const { data, error } = await supabase
      .from("articles")
      .update({ 
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", req.params.id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "ARTICLE_PUBLISH_FAILED",
      })
    }

    res.json(data)
  } catch (error) {
    console.error("Article publish error:", error)
    res.status(500).json({
      error: "Failed to publish article",
      code: "INTERNAL_ERROR",
    })
  }
})

// Delete article (admin/vet only)
router.delete("/:id", validationRules.uuidParam("id"), validateRequest, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "veterinarian") {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      })
    }

    let query = supabase.from("articles").delete().eq("id", req.params.id)

    // Vets can only delete their own articles, Admins can delete any.
    if (req.user.role === "veterinarian") {
      query = query.eq("author_id", req.user.id)
    }

    const { error } = await query

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: "ARTICLE_DELETION_FAILED",
      })
    }

    res.status(204).send()
  } catch (error) {
    console.error("Article deletion error:", error)
    res.status(500).json({
      error: "Failed to delete article",
      code: "INTERNAL_ERROR",
    })
  }
})

module.exports = router 