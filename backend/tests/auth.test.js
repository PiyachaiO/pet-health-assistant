const request = require('supertest')
const app = require('./test-server')

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
    })

    it('should reject invalid credentials', async () => {
      const userData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('message')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
        role: 'user'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('user')
    })

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Existing User',
        role: 'user'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('GET /api/auth/profile', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
    })

    it('should return user profile with valid token', async () => {
      // This would need a valid JWT token
      const token = 'valid-jwt-token'
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('user')
    })
  })
})
