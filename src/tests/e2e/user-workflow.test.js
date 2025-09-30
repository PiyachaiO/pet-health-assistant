import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'

// Mock API responses
const mockApiResponses = {
  '/api/auth/login': {
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: '1',
      email: 'user@example.com',
      full_name: 'Test User',
      role: 'user'
    }
  },
  '/api/pets': {
    success: true,
    pets: [
      {
        id: '1',
        name: 'Fluffy',
        species: 'cat',
        breed: 'Persian',
        age: 3,
        weight: 4.5,
        gender: 'female'
      }
    ]
  },
  '/api/appointments': {
    success: true,
    appointments: [
      {
        id: '1',
        appointment_date: '2024-01-15T10:00:00Z',
        status: 'pending',
        reason: 'Regular checkup',
        pet: { name: 'Fluffy' }
      }
    ]
  }
}

// Mock fetch globally
global.fetch = jest.fn((url, options) => {
  const endpoint = url.replace('http://localhost:5000', '')
  
  if (mockApiResponses[endpoint]) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiResponses[endpoint])
    })
  }
  
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ success: false, message: 'Not found' })
  })
})

describe('User Workflow E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should complete user registration and pet management workflow', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Step 1: User navigates to registration
    const registerLink = screen.getByText(/สมัครสมาชิก/i)
    await user.click(registerLink)

    // Step 2: User fills registration form
    const emailInput = screen.getByLabelText(/อีเมล/i)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/i)
    const nameInput = screen.getByLabelText(/ชื่อ-นามสกุล/i)
    const submitButton = screen.getByText(/สมัครสมาชิก/i)

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(nameInput, 'New User')
    await user.click(submitButton)

    // Step 3: User logs in
    await waitFor(() => {
      expect(screen.getByText(/เข้าสู่ระบบ/i)).toBeInTheDocument()
    })

    const loginEmailInput = screen.getByLabelText(/อีเมล/i)
    const loginPasswordInput = screen.getByLabelText(/รหัสผ่าน/i)
    const loginButton = screen.getByText(/เข้าสู่ระบบ/i)

    await user.type(loginEmailInput, 'user@example.com')
    await user.type(loginPasswordInput, 'password123')
    await user.click(loginButton)

    // Step 4: User sees dashboard
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })

    // Step 5: User adds new pet
    const addPetButton = screen.getByText(/เพิ่มสัตว์เลี้ยง/i)
    await user.click(addPetButton)

    // Fill pet form
    const petNameInput = screen.getByLabelText(/ชื่อสัตว์เลี้ยง/i)
    const speciesSelect = screen.getByLabelText(/ประเภท/i)
    const breedInput = screen.getByLabelText(/สายพันธุ์/i)
    const ageInput = screen.getByLabelText(/อายุ/i)
    const weightInput = screen.getByLabelText(/น้ำหนัก/i)
    const genderSelect = screen.getByLabelText(/เพศ/i)
    const savePetButton = screen.getByText(/บันทึก/i)

    await user.type(petNameInput, 'Buddy')
    await user.selectOptions(speciesSelect, 'dog')
    await user.type(breedInput, 'Golden Retriever')
    await user.type(ageInput, '3')
    await user.type(weightInput, '25.5')
    await user.selectOptions(genderSelect, 'male')
    await user.click(savePetButton)

    // Step 6: User books appointment
    const bookAppointmentButton = screen.getByText(/จองนัดหมาย/i)
    await user.click(bookAppointmentButton)

    // Fill appointment form
    const petSelect = screen.getByLabelText(/สัตว์เลี้ยง/i)
    const dateInput = screen.getByLabelText(/วันที่นัดหมาย/i)
    const reasonInput = screen.getByLabelText(/เหตุผล/i)
    const notesInput = screen.getByLabelText(/หมายเหตุ/i)
    const bookButton = screen.getByText(/จองนัดหมาย/i)

    await user.selectOptions(petSelect, '1') // Fluffy
    await user.type(dateInput, '2024-01-20')
    await user.type(reasonInput, 'Vaccination')
    await user.type(notesInput, 'Annual vaccination')
    await user.click(bookButton)

    // Step 7: User views their appointments
    await waitFor(() => {
      expect(screen.getByText(/นัดหมายของฉัน/i)).toBeInTheDocument()
    })

    // Step 8: User views pet profile
    const petCard = screen.getByText('Fluffy')
    await user.click(petCard)

    await waitFor(() => {
      expect(screen.getByText(/ข้อมูลสัตว์เลี้ยง/i)).toBeInTheDocument()
    })

    // Step 9: User logs out
    const logoutButton = screen.getByText(/ออกจากระบบ/i)
    await user.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByText(/เข้าสู่ระบบ/i)).toBeInTheDocument()
    })
  })

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, message: 'Server error' })
      })
    )

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Try to login with invalid credentials
    const emailInput = screen.getByLabelText(/อีเมล/i)
    const passwordInput = screen.getByLabelText(/รหัสผ่าน/i)
    const loginButton = screen.getByText(/เข้าสู่ระบบ/i)

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(loginButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument()
    })
  })
})
