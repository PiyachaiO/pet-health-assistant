const request = require('supertest')
const app = require('../test-server')

describe('Performance Tests', () => {
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

  describe('API Response Time Tests', () => {
    it('should respond to GET /api/pets within 500ms', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(500)
    })

    it('should respond to GET /api/appointments within 500ms', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(500)
    })

    it('should respond to GET /api/notifications within 500ms', async () => {
      const startTime = Date.now()
      
      await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(500)
    })
  })

  describe('Concurrent Request Tests', () => {
    it('should handle 10 concurrent requests to /api/pets', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/pets')
          .set('Authorization', `Bearer ${authToken}`)
      )

      const startTime = Date.now()
      const responses = await Promise.all(requests)
      const totalTime = Date.now() - startTime

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000)
    })

    it('should handle 5 concurrent pet creation requests', async () => {
      const petData = {
        name: 'Test Pet',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        gender: 'male'
      }

      const requests = Array(5).fill().map((_, index) =>
        request(app)
          .post('/api/pets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...petData,
            name: `Test Pet ${index}`
          })
      )

      const startTime = Date.now()
      const responses = await Promise.all(requests)
      const totalTime = Date.now() - startTime

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201)
      })

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(3000)
    })
  })

  describe('Memory Usage Tests', () => {
    it('should not leak memory during multiple requests', async () => {
      const initialMemory = process.memoryUsage()
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/pets')
          .set('Authorization', `Bearer ${authToken}`)
      }
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })

  describe('Database Query Performance', () => {
    it('should handle complex queries efficiently', async () => {
      const startTime = Date.now()
      
      // Test complex query with joins
      await request(app)
        .get('/api/appointments/vet')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(1000)
    })
  })

  describe('File Upload Performance', () => {
    it('should handle file upload within reasonable time', async () => {
      const testImageBuffer = Buffer.from('fake-image-data')
      
      const startTime = Date.now()
      
      await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImageBuffer, 'test.jpg')
        .expect(201)
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(2000)
    })
  })
})
