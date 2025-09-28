// Test setup configuration
const { createClient } = require('@supabase/supabase-js')

// Mock Supabase client for testing
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  }))
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))

// Mock Supabase config
jest.mock('../config/supabase', () => ({
  supabase: mockSupabaseClient,
  supabaseAdmin: mockSupabaseClient
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
process.env.PORT = '5001' // Use different port for tests

// Mock successful authentication responses
mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
  data: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User'
      }
    },
    session: {
      access_token: 'mock-jwt-token'
    }
  },
  error: null
})

mockSupabaseClient.auth.getUser.mockResolvedValue({
  data: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User'
      }
    }
  },
  error: null
})

// Mock database responses
mockSupabaseClient.from.mockImplementation((table) => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  }

  // Mock different responses based on table and operation
  if (table === 'users') {
    mockQuery.select.mockResolvedValue({
      data: [{
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user'
      }],
      error: null
    })
  } else if (table === 'pets') {
    mockQuery.select.mockResolvedValue({
      data: [{
        id: 'test-pet-id',
        name: 'Test Pet',
        species: 'dog',
        breed: 'Golden Retriever',
        user_id: 'test-user-id'
      }],
      error: null
    })
  }

  return mockQuery
})

// Global test timeout
jest.setTimeout(10000)
