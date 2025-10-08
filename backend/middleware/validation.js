const { body, param, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// Validation rules object that routes expect
const validationRules = {
  userRegistration: [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("full_name").trim().isLength({ min: 2 }).withMessage("Full name must be at least 2 characters long"),
    body("phone").optional().isMobilePhone("th-TH").withMessage("Please provide a valid Thai phone number"),
    body("address").optional().trim().isLength({ max: 200 }).withMessage("Address must be less than 200 characters"),
    body("role").optional().isIn(["user", "veterinarian", "admin"]).withMessage("Invalid role"),
    handleValidationErrors,
  ],

  userLogin: [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
  ],

  userProfileUpdate: [
    body("full_name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),
    body("phone").optional().isMobilePhone("th-TH").withMessage("Valid Thai phone number is required"),
    body("address").optional().trim().isLength({ max: 200 }).withMessage("Address must be less than 200 characters"),
    body("profile_picture_url").optional().custom((value) => {
      if (value === null || value === undefined || value === '') return true
      if (typeof value === 'string') return true
      throw new Error('Profile picture URL must be a string, null, undefined, or empty string')
    }).withMessage("Profile picture URL must be a valid string or null"),
    handleValidationErrors,
  ],

  petCreation: [
    body("name").trim().isLength({ min: 1 }).withMessage("Pet name is required"),
    body("species").isIn(["dog", "cat", "bird", "rabbit", "other"]).withMessage("Please select a valid species"),
    body("breed").optional().trim().isLength({ min: 1 }).withMessage("Breed cannot be empty if provided"),
    body("birth_date").optional().isISO8601().withMessage("Please provide a valid birth date"),
    body("weight").optional().isFloat({ min: 0 }).withMessage("Weight must be a positive number"),
    body("gender").optional().isIn(["male", "female", "unknown"]).withMessage("Invalid gender"),
    body("color").optional().trim().isLength({ max: 50 }).withMessage("Color must be less than 50 characters"),
    body("microchip_id").optional().trim().isLength({ max: 50 }).withMessage("Microchip ID must be less than 50 characters"),
    body("photo_url").optional().custom((value) => {
      if (value === null || value === undefined || value === '') return true
      return typeof value === 'string'
    }).withMessage("Photo URL must be a string or null"),
    handleValidationErrors,
  ],

  petUpdate: [
    body("name").optional().trim().isLength({ min: 1 }).withMessage("Pet name cannot be empty if provided"),
    body("species").optional().isIn(["dog", "cat", "bird", "rabbit", "other"]).withMessage("Please select a valid species"),
    body("breed").optional().trim().isLength({ min: 1 }).withMessage("Breed cannot be empty if provided"),
    body("birth_date").optional().isISO8601().withMessage("Please provide a valid birth date"),
    body("weight").optional().isFloat({ min: 0 }).withMessage("Weight must be a positive number"),
    body("gender").optional().isIn(["male", "female", "unknown"]).withMessage("Invalid gender"),
    body("color").optional().trim().isLength({ max: 50 }).withMessage("Color must be less than 50 characters"),
    body("microchip_id").optional().trim().isLength({ max: 50 }).withMessage("Microchip ID must be less than 50 characters"),
    body("photo_url").optional().custom((value) => {
      if (value === null || value === undefined || value === '') return true
      return typeof value === 'string'
    }).withMessage("Photo URL must be a string or null"),
    handleValidationErrors,
  ],

  appointmentCreation: [
    body("pet_id").isUUID().withMessage("Please provide a valid pet ID"),
    body("veterinarian_id").optional().isUUID().withMessage("Please provide a valid veterinarian ID"),
    body("appointment_type").isIn(["checkup", "vaccination", "consultation", "surgery", "emergency"]).withMessage("Invalid appointment type"),
    body("appointment_date").isISO8601().withMessage("Please provide a valid appointment date"),
    body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
    handleValidationErrors,
  ],

  appointmentUpdate: [
    body("appointment_type").optional().isIn(["checkup", "vaccination", "consultation", "surgery", "emergency"]).withMessage("Invalid appointment type"),
    body("appointment_date").optional().isISO8601().withMessage("Please provide a valid appointment date"),
    body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
    body("status").optional().isIn(["scheduled", "confirmed", "completed", "cancelled"]).withMessage("Invalid status"),
    handleValidationErrors,
  ],

  appointmentStatusUpdate: [
    body("status").isIn(["confirmed", "cancelled", "completed"]).withMessage("Invalid status for update"),
    handleValidationErrors,
  ],

  articleCreation: [
    body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
    body("content").trim().isLength({ min: 50 }).withMessage("Content must be at least 50 characters long"),
    body("excerpt").optional().trim().isLength({ max: 1000 }).withMessage("Excerpt must be less than 1000 characters"),
    body("category").trim().isLength({ min: 2, max: 100 }).withMessage("Category must be between 2 and 100 characters"),
    body("featured_image_url").optional().trim().isLength({ max: 500 }).withMessage("Featured image URL must be less than 500 characters"),
    body("is_published").optional().isBoolean().withMessage("is_published must be a boolean"),
    body("published_at").optional().isISO8601().withMessage("Please provide a valid published_at date"),
    handleValidationErrors,
  ],

  articleUpdate: [
    body("title").optional().trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
    body("content").optional().trim().isLength({ min: 50 }).withMessage("Content must be at least 50 characters long"),
    body("excerpt").optional().trim().isLength({ max: 1000 }).withMessage("Excerpt must be less than 1000 characters"),
    body("category").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Category must be between 2 and 100 characters"),
    body("featured_image_url").optional().trim().isLength({ max: 500 }).withMessage("Featured image URL must be less than 500 characters"),
    body("is_published").optional().isBoolean().withMessage("is_published must be a boolean"),
    body("published_at").optional().isISO8601().withMessage("Please provide a valid published_at date"),
    handleValidationErrors,
  ],

  // Nutrition Guideline (align with schema: required fields)
  nutritionGuidelineCreation: [
    body("species").isIn(["dog", "cat", "bird", "rabbit", "other"]).withMessage("Please select a valid species"),
    body("age_range").isIn(["puppy", "adult", "senior"]).withMessage("Invalid age range"),
    body("daily_calories").isInt({ min: 0 }).withMessage("Daily calories must be a positive integer"),
    body("protein_percentage").isFloat({ min: 0, max: 100 }).withMessage("Protein percentage must be between 0 and 100"),
    body("fat_percentage").isFloat({ min: 0, max: 100 }).withMessage("Fat percentage must be between 0 and 100"),
    body("feeding_frequency").isInt({ min: 1 }).withMessage("Feeding frequency must be a positive integer"),
    body("instructions").optional().trim().isLength({ min: 10 }).withMessage("Instructions must be at least 10 characters long"),
    handleValidationErrors,
  ],

  nutritionGuidelineUpdate: [
    body("species").optional().isIn(["dog", "cat", "bird", "rabbit", "other"]).withMessage("Please select a valid species"),
    body("age_range").optional().isIn(["puppy", "adult", "senior"]).withMessage("Invalid age range"),
    body("daily_calories").optional().isInt({ min: 0 }).withMessage("Daily calories must be a positive integer"),
    body("protein_percentage").optional().isFloat({ min: 0, max: 100 }).withMessage("Protein percentage must be between 0 and 100"),
    body("fat_percentage").optional().isFloat({ min: 0, max: 100 }).withMessage("Fat percentage must be between 0 and 100"),
    body("feeding_frequency").optional().isInt({ min: 1 }).withMessage("Feeding frequency must be a positive integer"),
    body("instructions").optional().trim().isLength({ min: 10 }).withMessage("Instructions must be at least 10 characters long"),
    handleValidationErrors,
  ],

  nutritionRecommendation: [
    body("pet_id").isUUID().withMessage("Valid pet ID is required"),
    body("guideline_id").optional().isUUID().withMessage("Please provide a valid guideline ID"),
    body("custom_calories").optional().isInt({ min: 0 }).withMessage("Custom calories must be a positive integer"),
    body("custom_instructions").optional().trim().isLength({ min: 10 }).withMessage("Custom instructions must be at least 10 characters long"),
    body("start_date").optional().isISO8601().withMessage("Please provide a valid start date"),
    body("end_date").optional().isISO8601().withMessage("Please provide a valid end date"),
    body("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
    handleValidationErrors,
  ],

  nutritionRecommendationUpdate: [
    body("pet_id").optional().isUUID().withMessage("Valid pet ID is required"),
    body("guideline_id").optional().isUUID().withMessage("Please provide a valid guideline ID"),
    body("custom_calories").optional().isInt({ min: 0 }).withMessage("Custom calories must be a positive integer"),
    body("custom_instructions").optional().trim().isLength({ min: 10 }).withMessage("Custom instructions must be at least 10 characters long"),
    body("start_date").optional().isISO8601().withMessage("Please provide a valid start date"),
    body("end_date").optional().isISO8601().withMessage("Please provide a valid end date"),
    body("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
    handleValidationErrors,
  ],

  healthRecordCreation: [
    body("record_type").isIn(["vaccination", "medication", "checkup", "surgery", "illness", "injury"]).withMessage("Invalid record type"),
    body("title").trim().isLength({ min: 3, max: 255 }).withMessage("Title must be between 3 and 255 characters"),
    body("description").optional().trim(),
    body("record_date").isISO8601().withMessage("Please provide a valid record date"),
    body("next_due_date").optional().isISO8601().withMessage("Please provide a valid next due date"),
    body("veterinarian_id").optional().isUUID().withMessage("Please provide a valid veterinarian ID"),
    // attachments is JSONB; allow any object
    handleValidationErrors,
  ],

  notificationCreation: [
    body("user_id").isUUID().withMessage("Please provide a valid user ID"),
    body("pet_id").optional().isUUID().withMessage("Please provide a valid pet ID"),
    body("notification_type").isIn([
      "vaccination_due",
      "medication_reminder",
      "appointment_reminder",
      "checkup_due",
    ]).withMessage("Invalid notification type"),
    body("title").trim().isLength({ min: 3, max: 255 }).withMessage("Title must be between 3 and 255 characters"),
    body("message").trim().isLength({ min: 5, max: 2000 }).withMessage("Message must be between 5 and 2000 characters"),
    body("due_date").optional().isISO8601().withMessage("Please provide a valid due date"),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]).withMessage("Invalid priority"),
    body("is_read").optional().isBoolean().withMessage("is_read must be a boolean"),
    body("is_completed").optional().isBoolean().withMessage("is_completed must be a boolean"),
    handleValidationErrors,
  ],

  uuidParam: (paramName) => [
    param(paramName).isUUID().withMessage(`Please provide a valid ${paramName} ID`),
    handleValidationErrors,
  ],

  vetApplicationSubmission: [
    body("license_number")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("License number must be between 3 and 100 characters"),
    body("experience_years")
      .isInt({ min: 0, max: 50 })
      .withMessage("Experience years must be between 0 and 50"),
    body("workplace")
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage("Workplace must be between 3 and 255 characters"),
    body("specialization")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Specialization must be less than 100 characters"),
    body("additional_info")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Additional info must be less than 500 characters"),
    body("license_document_url")
      .optional()
      .isURL()
      .withMessage("License document URL must be a valid URL"),
    body("portfolio_url")
      .optional()
      .isURL()
      .withMessage("Portfolio URL must be a valid URL"),
    handleValidationErrors,
  ],

  vetApplicationApproval: [
    body("admin_notes")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Admin notes must be less than 500 characters"),
    handleValidationErrors,
  ],

  vetApplicationRejection: [
    body("rejection_reason")
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage("Rejection reason must be between 5 and 500 characters"),
    body("admin_notes")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Admin notes must be less than 500 characters"),
    handleValidationErrors,
  ],
}

// Legacy validation functions (for backward compatibility)
const validateRegistration = validationRules.userRegistration
const validateLogin = validationRules.userLogin
const validatePet = validationRules.petCreation
const validateAppointment = validationRules.appointmentCreation

module.exports = {
  validationRules,
  validateRequest: handleValidationErrors,
  validateRegistration,
  validateLogin,
  validatePet,
  validateAppointment,
  handleValidationErrors,
}