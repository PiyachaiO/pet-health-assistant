const express = require("express")
const { supabase } = require("../config/supabase")
const { validationRules, validateRequest } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")
const { notifyAllNewArticlePublished } = require("../services/notificationService")

const router = express.Router()

// CORS middleware for articles routes
router.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://frontend-one-ashen-93.vercel.app',
    'https://frontend-nmwrwmfmm-piyachais-projects.vercel.app',
    'https://pet-health-assistant-one.vercel.app'
  ]
  
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  next()
})

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

    // Transform the data to match frontend expectations
    const transformedData = {
      ...data,
      author_name: data.users?.full_name || 'Unknown Author'
    }
    
    res.json(transformedData)
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

    // Auto-publish สำหรับทั้ง Admin และ Vet
    const shouldAutoPublish = req.user.role === 'admin' || req.user.role === 'veterinarian';
    
    const articleData = {
      ...req.body,
      author_id: req.user.id,
      is_published: shouldAutoPublish, // Auto-publish เมื่อ Admin หรือ Vet สร้าง
      published_at: shouldAutoPublish ? new Date().toISOString() : null 
    }

    console.log('[Article Create] User role:', req.user.role);
    console.log('[Article Create] Will auto-publish:', shouldAutoPublish);

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

    console.log('[Article Create] Created article:', data.id, 'is_published:', data.is_published);

    // ส่งการแจ้งเตือนเมื่อ Admin หรือ Vet สร้างบทความ (auto-publish)
    if (data.is_published) {
      try {
        console.log('[Article Created & Published] Sending notification to all users for article:', data.id);
        await notifyAllNewArticlePublished({
          id: data.id,
          title: data.title,
          author_id: data.author_id,
          category: data.category
        });
      } catch (notificationError) {
        console.error('[Article Created] Failed to send notification:', notificationError);
      }
    } else {
      console.log('[Article Create] Article saved as draft, no notification sent');
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
        is_published: true,
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

    // Send notification to all users about new published article
    try {
      console.log('[Article Published] Sending notification to all users for article:', data.id);
      await notifyAllNewArticlePublished({
        id: data.id,
        title: data.title,
        author_id: data.author_id,
        category: data.category
      });
    } catch (notificationError) {
      console.error('[Article Published] Failed to send notification:', notificationError);
      // Don't fail the publish if notification fails
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