import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge } from '../badge'

describe('Badge component', () => {
  it('renders text and applies variant classes', () => {
    render(<Badge variant="secondary">Hello</Badge>)
    const badge = screen.getByText('Hello')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-secondary')
  })
})
