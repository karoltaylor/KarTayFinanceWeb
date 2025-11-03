import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from './Pagination'

const setup = (props = {}) => {
  const onPageChange = vi.fn()
  const ui = render(
    <Pagination
      currentPage={1}
      totalPages={6}
      totalCount={588}
      hasNext={true}
      hasPrev={false}
      loading={false}
      onPageChange={onPageChange}
      {...props}
    />
  )
  return { onPageChange, ...ui }
}

describe('Pagination', () => {
  it('renders basic info and controls', () => {
    setup()
    expect(screen.getByText(/Showing 588 total transactions/i)).toBeInTheDocument()
    expect(screen.getByText(/Page 1 of 6/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled()
  })

  it('invokes onPageChange when next is clicked', () => {
    const { onPageChange } = setup()
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('invokes onPageChange when page number clicked', () => {
    const { onPageChange } = setup()
    const btn2 = screen.getAllByRole('button').find(b => b.textContent === '2')
    fireEvent.click(btn2)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables buttons while loading', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={6}
        totalCount={588}
        hasNext={true}
        hasPrev={true}
        loading={true}
        onPageChange={() => {}}
      />
    )
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled()
  })
})
