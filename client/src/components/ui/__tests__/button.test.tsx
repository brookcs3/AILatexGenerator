import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button component', () => {
  it('applies default variant classes', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('variable-gradient')
  })
})
