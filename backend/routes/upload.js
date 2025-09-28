const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const { upload, handleUploadError, uploadDir } = require("../middleware/upload")

const router = express.Router()

// Apply authentication middleware to all routes except image serving
router.use((req, res, next) => {
  // Skip authentication for image serving
  if (req.path.startsWith('/image/')) {
    return next()
  }
  return authenticateToken(req, res, next)
})

// Upload image for articles (multipart/form-data; field name: image)
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
        code: "NO_IMAGE",
      })
    }

    // ตรวจสอบว่าเป็นรูปภาพหรือไม่
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: "File must be an image",
        code: "INVALID_FILE_TYPE",
      })
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploaded_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Image upload error:", error)
    res.status(500).json({
      error: "Failed to upload image",
      code: "INTERNAL_ERROR",
    })
  }
})

// Upload single file (multipart/form-data; field name: file)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        code: "NO_FILE",
      })
    }

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        uploaded_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("File upload error:", error)
    res.status(500).json({
      error: "Failed to upload file",
      code: "INTERNAL_ERROR",
    })
  }
})

// Upload multiple files
// Upload multiple files (multipart/form-data; field name: files)
router.post("/multiple", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
        code: "NO_FILES",
      })
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploaded_at: new Date().toISOString(),
    }))

    res.status(201).json({
      message: `${files.length} files uploaded successfully`,
      files,
    })
  } catch (error) {
    console.error("Multiple files upload error:", error)
    res.status(500).json({
      error: "Failed to upload files",
      code: "INTERNAL_ERROR",
    })
  }
})

// Serve image file with CORS
router.get("/image/:filename", (req, res) => {
  try {
    const fs = require("fs")
    const path = require("path")
    const filename = req.params.filename
    
    // Security check - only allow files that start with user ID
    if (!filename || !filename.includes("_")) {
      return res.status(404).json({ error: "File not found" })
    }
    
    const filePath = path.join(uploadDir, filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" })
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length')
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }
    
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
    
  } catch (error) {
    console.error("Image serve error:", error)
    res.status(500).json({
      error: "Failed to serve image",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get user's uploaded files
router.get("/", async (req, res) => {
  try {
    const fs = require("fs")
    const path = require("path")
    const userPrefix = String(req.user.id)
    const all = fs.readdirSync(uploadDir)
    const mine = all.filter((f) => f.startsWith(userPrefix + "_"))
    const files = mine.map((filename) => {
      const full = path.join(uploadDir, filename)
      const stat = fs.statSync(full)
      return {
        filename,
        mimetype: undefined,
        size: stat.size,
        url: `/api/upload/image/${filename}`,
        uploaded_at: stat.mtime.toISOString(),
      }
    })
    files.sort((a, b) => (a.uploaded_at < b.uploaded_at ? 1 : -1))
    res.json(files)
  } catch (error) {
    console.error("Files fetch error:", error)
    res.status(500).json({
      error: "Failed to fetch files",
      code: "INTERNAL_ERROR",
    })
  }
})

// Delete file
router.delete("/:filename", async (req, res) => {
  try {
    const fs = require("fs")
    const path = require("path")
    const userPrefix = String(req.user.id)
    const filename = req.params.filename
    if (!filename || !filename.startsWith(userPrefix + "_")) {
      return res.status(404).json({ error: "File not found", code: "FILE_NOT_FOUND" })
    }
    const full = path.join(uploadDir, filename)
    if (!fs.existsSync(full)) {
      return res.status(404).json({ error: "File not found", code: "FILE_NOT_FOUND" })
    }
    fs.unlinkSync(full)
    res.status(204).send()
  } catch (error) {
    console.error("File deletion error:", error)
    res.status(500).json({
      error: "Failed to delete file",
      code: "INTERNAL_ERROR",
    })
  }
})

// Multer/Same-route error handler
router.use(handleUploadError)

module.exports = router 