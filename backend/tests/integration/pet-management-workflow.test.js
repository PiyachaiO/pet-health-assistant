const request = require('supertest')
const app = require('../test-server')

describe('Pet Management Workflow Integration', () => {
  let userToken
  let vetToken
  let testPetId

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

  it('should complete full pet management workflow', async () => {
    // Step 1: User creates pet
    const petData = {
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 25.5,
      gender: 'male',
      color: 'Golden',
      microchip_id: '123456789'
    }

    const createResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${userToken}`)
      .send(petData)
      .expect(201)

    expect(createResponse.body).toHaveProperty('success', true)
    testPetId = createResponse.body.pet.id

    // Step 2: User views their pets
    const petsResponse = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(petsResponse.body.pets).toContainEqual(
      expect.objectContaining({
        id: testPetId,
        name: 'Buddy'
      })
    )

    // Step 3: Vet views patient pets
    const vetPetsResponse = await request(app)
      .get('/api/pets/vet')
      .set('Authorization', `Bearer ${vetToken}`)
      .expect(200)

    expect(vetPetsResponse.body.pets).toContainEqual(
      expect.objectContaining({
        id: testPetId,
        name: 'Buddy'
      })
    )

    // Step 4: Vet creates health record
    const healthRecordData = {
      pet_id: testPetId,
      visit_date: '2024-01-15',
      weight: 26.0,
      temperature: 38.5,
      heart_rate: 80,
      respiratory_rate: 20,
      symptoms: 'Normal checkup',
      diagnosis: 'Healthy',
      treatment: 'No treatment needed',
      notes: 'Pet is in good health'
    }

    const healthRecordResponse = await request(app)
      .post(`/api/pets/${testPetId}/health-records`)
      .set('Authorization', `Bearer ${vetToken}`)
      .send(healthRecordData)
      .expect(201)

    expect(healthRecordResponse.body).toHaveProperty('success', true)

    // Step 5: Vet creates nutrition plan
    const nutritionPlanData = {
      pet_id: testPetId,
      plan_name: 'Weight Management Plan',
      target_weight: 24.0,
      current_weight: 26.0,
      daily_calories: 800,
      feeding_schedule: '2 meals per day',
      recommended_foods: ['High-quality dog food', 'Vegetables'],
      restrictions: ['No table scraps'],
      notes: 'Focus on weight reduction'
    }

    const nutritionResponse = await request(app)
      .post('/api/nutrition/recommendations')
      .set('Authorization', `Bearer ${vetToken}`)
      .send(nutritionPlanData)
      .expect(201)

    expect(nutritionResponse.body).toHaveProperty('success', true)

    // Step 6: User views pet health records
    const petHealthResponse = await request(app)
      .get(`/api/pets/${testPetId}/health-records`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(petHealthResponse.body.health_records).toHaveLength(1)
    expect(petHealthResponse.body.health_records[0]).toMatchObject({
      weight: 26.0,
      diagnosis: 'Healthy'
    })

    // Step 7: User views nutrition recommendations
    const nutritionViewResponse = await request(app)
      .get(`/api/nutrition/recommendations?pet_id=${testPetId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(nutritionViewResponse.body).toHaveLength(1)
    expect(nutritionViewResponse.body[0]).toMatchObject({
      plan_name: 'Weight Management Plan',
      target_weight: 24.0
    })

    // Step 8: User updates pet information
    const updateData = {
      weight: 25.0,
      notes: 'Weight is improving'
    }

    const updateResponse = await request(app)
      .put(`/api/pets/${testPetId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData)
      .expect(200)

    expect(updateResponse.body.pet.weight).toBe(25.0)

    // Step 9: User deletes pet (cleanup)
    const deleteResponse = await request(app)
      .delete(`/api/pets/${testPetId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(deleteResponse.body).toHaveProperty('success', true)
  })
})
