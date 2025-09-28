const request = require('supertest')
const app = require('./test-server')
const path = require('path')
const fs = require('fs')

describe('Upload API', () => {
  let authToken

  beforeAll(async () => {
    // Setup test user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
    
    authToken = loginResponse.body.token
  })

  describe('POST /api/upload', () => {
    it('should upload image file', async () => {
      // Create a test image file
      const testImagePath = path.join(__dirname, 'test-image.jpg')
      const testImageBuffer = Buffer.from('fake-image-data')
      fs.writeFileSync(testImagePath, testImageBuffer)

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('file')
      expect(response.body.file).toHaveProperty('url')

      // Cleanup
      fs.unlinkSync(testImagePath)
    })

    it('should reject non-image files', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt')
      fs.writeFileSync(testFilePath, 'test content')

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testFilePath)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)

      // Cleanup
      fs.unlinkSync(testFilePath)
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
    })

    it('should validate file size', async () => {
      // Create a large test file (simulate oversized file)
      const largeFilePath = path.join(__dirname, 'large-test.jpg')
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024) // 10MB
      fs.writeFileSync(largeFilePath, largeBuffer)

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', largeFilePath)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)

      // Cleanup
      fs.unlinkSync(largeFilePath)
    })
  })

  describe('GET /api/upload/image/:filename', () => {
    it('should serve uploaded image', async () => {
      const filename = 'test-image.jpg'
      
      const response = await request(app)
        .get(`/api/upload/image/${filename}`)
        .expect(200)

      expect(response.headers['content-type']).toMatch(/image/)
    })

    it('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .get('/api/upload/image/non-existent.jpg')
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
    })
  })
})
