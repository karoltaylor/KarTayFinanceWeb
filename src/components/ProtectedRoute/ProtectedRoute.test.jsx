import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

vi.mock('../../config/authorization', () => ({
  isUserAuthorized: vi.fn(() => true)
}))

vi.mock('../../pages/Login/Login', () => ({
  default: () => <div>LoginPage</div>
}))

vi.mock('../LoadingSpinner/LoadingSpinner', () => ({
  default: () => <div role="status">Loading</div>
}))

vi.mock('../Unauthorized/Unauthorized', () => ({
  default: () => <div>UnauthorizedPage</div>
}))

const { useAuth } = await import('../../contexts/AuthContext')
const { isUserAuthorized } = await import('../../config/authorization')

describe('ProtectedRoute', () => {
  it('shows loader while loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    render(<ProtectedRoute><div>App</div></ProtectedRoute>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows login when no user', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    render(<ProtectedRoute><div>App</div></ProtectedRoute>)
    expect(screen.getByText('LoginPage')).toBeInTheDocument()
  })

  it('renders children when authorized', () => {
    useAuth.mockReturnValue({ user: { email: 'test@ex.com' }, loading: false })
    isUserAuthorized.mockReturnValue(true)
    render(<ProtectedRoute><div>App</div></ProtectedRoute>)
    expect(screen.getByText('App')).toBeInTheDocument()
  })

  it('shows unauthorized when not in whitelist', () => {
    useAuth.mockReturnValue({ user: { email: 'x@y.com' }, loading: false })
    isUserAuthorized.mockReturnValue(false)
    render(<ProtectedRoute><div>App</div></ProtectedRoute>)
    expect(screen.getByText('UnauthorizedPage')).toBeInTheDocument()
  })
})
