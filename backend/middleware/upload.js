const multer = require("multer")
const sharp = require("sharp")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || "./uploads"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase()
    const userPrefix = req && req.user && req.user.id ? String(req.user.id) : "anonymous"
    const uniqueName = `${userPrefix}_${Date.now()}_${uuidv4()}${fileExtension}`
    cb(null, uniqueName)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Maximum 5 files per request
  },
})

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next()
  }

  try {
    // Process image with sharp
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Add processed image to request
    req.processedImage = {
      buffer: processedImageBuffer,
      mimetype: "image/jpeg",
      originalname: req.file.originalname,
    }

    next()
  } catch (error) {
    console.error("Image processing error:", error)
    res.status(400).json({ message: "Error processing image" })
  }
}

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          error: "File too large",
          message: `File size must be less than ${Math.round((Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024) / 1024 / 1024)}MB`,
          code: "FILE_TOO_LARGE",
        })
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          error: "Too many files",
          message: "Maximum 5 files allowed per request",
          code: "TOO_MANY_FILES",
        })
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          error: "Unexpected field",
          message: "Unexpected file field",
          code: "UNEXPECTED_FIELD",
        })
      default:
        return res.status(400).json({
          error: "Upload error",
          message: error.message,
          code: "UPLOAD_ERROR",
        })
    }
  }

  if (error.message.includes("File type not allowed") || error.message.includes("Only image files are allowed")) {
    return res.status(400).json({
      error: "Invalid file type",
      message: error.message,
      code: "INVALID_FILE_TYPE",
    })
  }

  next(error)
}

// Utility function to delete file
const deleteFile = (filename) => {
  try {
    const filePath = path.join(uploadDir, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

module.exports = {
  upload,
  processImage,
  handleUploadError,
  deleteFile,
  uploadDir,
}
