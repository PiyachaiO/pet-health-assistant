const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const cloudinary = require("../config/cloudinary")
const multer = require("multer")

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Configure multer for memory storage (Cloudinary needs buffer)
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Upload image to Cloudinary
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
        code: "NO_IMAGE",
      })
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: "pet-health", // Organize images in a folder
        resource_type: "auto", // Auto-detect image type
        quality: "auto", // Auto-optimize quality
        fetch_format: "auto", // Auto-optimize format (WebP for modern browsers)
      }
    )

    res.status(201).json({
      message: "Image uploaded successfully to Cloudinary",
      url: result.secure_url,
      public_id: result.public_id,
      filename: result.original_filename,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      uploaded_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    res.status(500).json({
      error: "Failed to upload image to Cloudinary",
      code: "CLOUDINARY_ERROR",
      details: error.message,
    })
  }
})

// Delete image from Cloudinary
router.delete("/image/:public_id", async (req, res) => {
  try {
    const { public_id } = req.params
    
    if (!public_id) {
      return res.status(400).json({
        error: "Public ID is required",
        code: "MISSING_PUBLIC_ID",
      })
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id)
    
    if (result.result === 'ok') {
      res.status(200).json({
        message: "Image deleted successfully from Cloudinary",
        public_id: public_id,
        deleted_at: new Date().toISOString(),
      })
    } else {
      res.status(404).json({
        error: "Image not found in Cloudinary",
        code: "IMAGE_NOT_FOUND",
      })
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    res.status(500).json({
      error: "Failed to delete image from Cloudinary",
      code: "CLOUDINARY_DELETE_ERROR",
      details: error.message,
    })
  }
})

// Get image info from Cloudinary
router.get("/image/:public_id", async (req, res) => {
  try {
    const { public_id } = req.params
    
    if (!public_id) {
      return res.status(400).json({
        error: "Public ID is required",
        code: "MISSING_PUBLIC_ID",
      })
    }

    // Get image info from Cloudinary
    const result = await cloudinary.api.resource(public_id)
    
    res.status(200).json({
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      created_at: result.created_at,
    })
  } catch (error) {
    console.error("Cloudinary get info error:", error)
    res.status(500).json({
      error: "Failed to get image info from Cloudinary",
      code: "CLOUDINARY_INFO_ERROR",
      details: error.message,
    })
  }
})

module.exports = router
