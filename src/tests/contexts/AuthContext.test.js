import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider } from '../../contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock API client
jest.mock('../../services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, login, logout, loading } = React.useContext(AuthContext)
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div data-testid="user-info">
          <span data-testid="user-name">{user.full_name}</span>
          <span data-testid="user-role">{user.role}</span>
        </div>
      ) : (
        <div data-testid="no-user">No user logged in</div>
      )}
    </div>
  )
}

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should render loading state initially', () => {
    renderWithAuth(<TestComponent />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show no user when not logged in', async () => {
    renderWithAuth(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument()
    })
  })

  it('should handle login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user'
    }

    const { login } = renderWithAuth(<TestComponent />)
    
    await act(async () => {
      await login('test@example.com', 'password123')
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
      expect(screen.getByTestId('user-role')).toHaveTextContent('user')
    })
  })

  it('should handle logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user'
    }

    const { logout } = renderWithAuth(<TestComponent />)
    
    await act(async () => {
      await logout()
    })

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument()
    })
  })
})
