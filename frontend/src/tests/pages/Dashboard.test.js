import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'

// Mock AuthContext
const mockUser = {
  id: '1',
  email: 'user@example.com',
  full_name: 'Test User',
  role: 'user'
}

const mockAuthContext = {
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
}

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

// Mock API services
jest.mock('../../services/api', () => ({
  get: jest.fn()
}))

const mockApi = require('../../services/api')

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dashboard for user', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        pets: [
          { id: '1', name: 'Fluffy', species: 'cat' },
          { id: '2', name: 'Buddy', species: 'dog' }
        ],
        appointments: [
          { id: '1', appointment_date: '2024-01-15', status: 'pending' }
        ],
        notifications: [
          { id: '1', message: 'New appointment scheduled' }
        ]
      }
    })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('สัตว์เลี้ยงของฉัน')).toBeInTheDocument()
      expect(screen.getByText('นัดหมายล่าสุด')).toBeInTheDocument()
      expect(screen.getByText('การแจ้งเตือน')).toBeInTheDocument()
    })
  })

  it('should display pets list', async () => {
    const mockPets = [
      { id: '1', name: 'Fluffy', species: 'cat', breed: 'Persian' },
      { id: '2', name: 'Buddy', species: 'dog', breed: 'Golden Retriever' }
    ]

    mockApi.get.mockResolvedValue({
      data: { pets: mockPets }
    })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Fluffy')).toBeInTheDocument()
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })
  })

  it('should display appointments', async () => {
    const mockAppointments = [
      {
        id: '1',
        appointment_date: '2024-01-15T10:00:00Z',
        status: 'pending',
        reason: 'Regular checkup'
      }
    ]

    mockApi.get.mockResolvedValue({
      data: { appointments: mockAppointments }
    })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Regular checkup')).toBeInTheDocument()
    })
  })

  it('should display notifications', async () => {
    const mockNotifications = [
      {
        id: '1',
        message: 'New appointment scheduled',
        type: 'appointment',
        is_read: false
      }
    ]

    mockApi.get.mockResolvedValue({
      data: { notifications: mockNotifications }
    })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('New appointment scheduled')).toBeInTheDocument()
    })
  })

  it('should handle loading state', () => {
    mockApi.get.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument()
  })

  it('should handle error state', async () => {
    mockApi.get.mockRejectedValue(new Error('API Error'))

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument()
    })
  })

  it('should show empty state when no data', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        pets: [],
        appointments: [],
        notifications: []
      }
    })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีสัตว์เลี้ยง')).toBeInTheDocument()
      expect(screen.getByText('ยังไม่มีนัดหมาย')).toBeInTheDocument()
    })
  })
})
