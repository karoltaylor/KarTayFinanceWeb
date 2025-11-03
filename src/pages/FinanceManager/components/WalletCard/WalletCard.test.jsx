import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WalletCard from './WalletCard'

vi.mock('../../utils/financeUtils', () => ({
  formatCurrency: (n) => `$${n.toFixed(2)}`
}))

describe('WalletCard', () => {
  it('renders wallet name, balance and totalTransactionCount', () => {
    const wallet = { name: 'My Wallet', balance: 123.45, transactions: [{ id: 1 }], totalTransactionCount: 5 }
    render(<WalletCard wallet={wallet} isSelected={false} onSelect={() => {}} onRemove={() => {}} />)
    expect(screen.getByText('My Wallet')).toBeInTheDocument()
    expect(screen.getByText('$123.45')).toBeInTheDocument()
    expect(screen.getByText(/5 transactions/)).toBeInTheDocument()
  })
})
