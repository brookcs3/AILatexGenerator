import { render, screen } from '@testing-library/react';
import AnonymousUserBanner from '../anonymous-user-banner';

describe('AnonymousUserBanner', () => {
  it('shows welcome message when usage remaining', () => {
    render(<AnonymousUserBanner usageRemaining={true} />);
    expect(screen.getByText('Welcome to AI LaTeX Generator!')).toBeInTheDocument();
  });

  it('shows used up message when no usage remaining', () => {
    render(<AnonymousUserBanner usageRemaining={false} />);
    expect(screen.getByText("You've used your free conversion")).toBeInTheDocument();
  });
});
