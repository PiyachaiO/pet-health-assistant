const request = require('supertest')
const app = require('./test-server')

describe('Pets API', () => {
  let authToken
  let testPetId

  beforeAll(async () => {
    // Setup test user and get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
    
    authToken = loginResponse.body.token
  })

  describe('GET /api/pets', () => {
    it('should get user pets', async () => {
      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(Array.isArray(response.body.pets)).toBe(true)
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/pets')
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('POST /api/pets', () => {
    it('should create new pet', async () => {
      const petData = {
        name: 'Test Pet',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        gender: 'male'
      }

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(petData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('pet')
      expect(response.body.pet.name).toBe(petData.name)
      
      testPetId = response.body.pet.id
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('GET /api/pets/:id', () => {
    it('should get pet by ID', async () => {
      const response = await request(app)
        .get(`/api/pets/${testPetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('pet')
    })

    it('should return 404 for non-existent pet', async () => {
      const response = await request(app)
        .get('/api/pets/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('PUT /api/pets/:id', () => {
    it('should update pet', async () => {
      const updateData = {
        name: 'Updated Pet Name',
        age: 4
      }

      const response = await request(app)
        .put(`/api/pets/${testPetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.pet.name).toBe(updateData.name)
    })
  })

  describe('DELETE /api/pets/:id', () => {
    it('should delete pet', async () => {
      const response = await request(app)
        .delete(`/api/pets/${testPetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
    })
  })
})
