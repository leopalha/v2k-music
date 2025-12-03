import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders correctly with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders required asterisk when required', () => {
    render(<Input label="Password" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles onChange callback', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
    expect(handleChange).toHaveBeenLastCalledWith('test');
  });

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email format" />);
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('applies error styles when error exists', () => {
    const { container } = render(<Input error="Error message" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-error');
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
  });

  it('renders icon in left position', () => {
    const icon = <span data-testid="test-icon">🔍</span>;
    render(<Input icon={icon} iconPosition="left" />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders icon in right position', () => {
    const icon = <span data-testid="test-icon">✓</span>;
    render(<Input icon={icon} iconPosition="right" />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders with name attribute', () => {
    const { container } = render(<Input name="email" />);
    const input = container.querySelector('input[name="email"]');
    expect(input).toBeInTheDocument();
  });

  it('renders with data-testid attribute', () => {
    render(<Input data-testid="custom-input" />);
    expect(screen.getByTestId('custom-input')).toBeInTheDocument();
  });

  it('supports different input types', () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector('input.custom-class');
    expect(input).toBeInTheDocument();
  });
});
