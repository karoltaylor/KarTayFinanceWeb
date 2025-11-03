import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Unauthorized from './Unauthorized'

describe('Unauthorized', () => {
  it('renders access denied content', () => {
    render(<Unauthorized userEmail="test@example.com" onSignOut={() => {}} allowedEmails={["a@b.com"]} />)
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
  })
})
