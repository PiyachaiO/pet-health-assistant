// Test server configuration
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

// Import routes
const authRoutes = require('../routes/auth')
const petsRoutes = require('../routes/pets')
const appointmentsRoutes = require('../routes/appointments')
const uploadRoutes = require('../routes/upload')
const adminRoutes = require('../routes/admin')
const usersRoutes = require('../routes/users')
const articlesRoutes = require('../routes/articles')
const notificationsRoutes = require('../routes/notifications')
const nutritionRoutes = require('../routes/nutrition')

const app = express()

// Middleware
app.use(helmet())
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'false')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Authorization')
  next()
})

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for testing
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/pets', petsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/nutrition', nutritionRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

module.exports = app
