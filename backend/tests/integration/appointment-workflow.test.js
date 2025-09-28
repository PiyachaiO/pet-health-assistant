const request = require('supertest')
const app = require('../test-server')

describe('Appointment Workflow Integration', () => {
  let userToken
  let vetToken
  let testPetId
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

    // Create test pet
    const petResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Pet',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        gender: 'male'
      })
    testPetId = petResponse.body.pet.id
  })

  it('should complete full appointment workflow', async () => {
    // Step 1: User creates appointment
    const appointmentData = {
      pet_id: testPetId,
      appointment_date: '2024-01-15T10:00:00Z',
      reason: 'Regular checkup',
      notes: 'Annual health check'
    }

    const createResponse = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send(appointmentData)
      .expect(201)

    expect(createResponse.body).toHaveProperty('success', true)
    testAppointmentId = createResponse.body.appointment.id

    // Step 2: Vet views pending appointments
    const vetAppointmentsResponse = await request(app)
      .get('/api/appointments/vet')
      .set('Authorization', `Bearer ${vetToken}`)
      .expect(200)

    expect(vetAppointmentsResponse.body.appointments).toContainEqual(
      expect.objectContaining({
        id: testAppointmentId,
        status: 'pending'
      })
    )

    // Step 3: Vet confirms appointment
    const confirmResponse = await request(app)
      .put(`/api/appointments/${testAppointmentId}/status`)
      .set('Authorization', `Bearer ${vetToken}`)
      .send({ status: 'confirmed' })
      .expect(200)

    expect(confirmResponse.body.appointment.status).toBe('confirmed')

    // Step 4: User views confirmed appointment
    const userAppointmentsResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(userAppointmentsResponse.body.appointments).toContainEqual(
      expect.objectContaining({
        id: testAppointmentId,
        status: 'confirmed'
      })
    )

    // Step 5: Vet completes appointment
    const completeResponse = await request(app)
      .put(`/api/appointments/${testAppointmentId}/status`)
      .set('Authorization', `Bearer ${vetToken}`)
      .send({ status: 'completed' })
      .expect(200)

    expect(completeResponse.body.appointment.status).toBe('completed')
  })

  it('should handle appointment cancellation workflow', async () => {
    // Create another appointment
    const appointmentData = {
      pet_id: testPetId,
      appointment_date: '2024-01-20T14:00:00Z',
      reason: 'Vaccination',
      notes: 'Annual vaccination'
    }

    const createResponse = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send(appointmentData)
      .expect(201)

    const appointmentId = createResponse.body.appointment.id

    // User cancels appointment
    const cancelResponse = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(cancelResponse.body).toHaveProperty('success', true)

    // Verify appointment is cancelled
    const userAppointmentsResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(userAppointmentsResponse.body.appointments).not.toContainEqual(
      expect.objectContaining({ id: appointmentId })
    )
  })
})
