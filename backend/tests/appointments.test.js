const request = require('supertest')
const app = require('./test-server')

describe('Appointments API', () => {
  let userToken
  let vetToken
  let testAppointmentId

  beforeAll(async () => {
    // Setup test users
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      })
    userToken = userLogin.body.token

    const vetLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vet@example.com',
        password: 'password123'
      })
    vetToken = vetLogin.body.token
  })

  describe('POST /api/appointments', () => {
    it('should create new appointment', async () => {
      const appointmentData = {
        pet_id: 'test-pet-id',
        appointment_date: '2024-01-15T10:00:00Z',
        reason: 'Regular checkup',
        notes: 'Annual health check'
      }

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appointmentData)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('appointment')
      testAppointmentId = response.body.appointment.id
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('GET /api/appointments', () => {
    it('should get user appointments', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(Array.isArray(response.body.appointments)).toBe(true)
    })

    it('should get vet appointments', async () => {
      const response = await request(app)
        .get('/api/appointments/vet')
        .set('Authorization', `Bearer ${vetToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(Array.isArray(response.body.appointments)).toBe(true)
    })
  })

  describe('PUT /api/appointments/:id/status', () => {
    it('should update appointment status', async () => {
      const statusData = {
        status: 'confirmed'
      }

      const response = await request(app)
        .put(`/api/appointments/${testAppointmentId}/status`)
        .set('Authorization', `Bearer ${vetToken}`)
        .send(statusData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.appointment.status).toBe('confirmed')
    })

    it('should validate status values', async () => {
      const statusData = {
        status: 'invalid-status'
      }

      const response = await request(app)
        .put(`/api/appointments/${testAppointmentId}/status`)
        .set('Authorization', `Bearer ${vetToken}`)
        .send(statusData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('DELETE /api/appointments/:id', () => {
    it('should cancel appointment', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
    })
  })
})
