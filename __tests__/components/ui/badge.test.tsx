import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders correctly with children', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-bg-secondary');
  });

  it('renders with primary variant', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-primary-400/10');
    expect(badge).toHaveClass('text-primary-400');
  });

  it('renders with success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-success/10');
    expect(badge).toHaveClass('text-success');
  });

  it('renders with warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-warning/10');
    expect(badge).toHaveClass('text-warning');
  });

  it('renders with error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-error/10');
    expect(badge).toHaveClass('text-error');
  });

  it('renders with small size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('text-[10px]');
  });

  it('renders with medium size (default)', () => {
    const { container } = render(<Badge>Medium</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('text-xs');
  });

  it('renders with large size', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-3');
    expect(badge).toHaveClass('text-sm');
  });

  it('renders with icon', () => {
    const icon = <span data-testid="badge-icon">⭐</span>;
    render(<Badge icon={icon}>With Icon</Badge>);
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-class');
  });

  it('supports onClick handler', () => {
    const handleClick = jest.fn();
    render(<Badge onClick={handleClick}>Clickable</Badge>);
    
    const badge = screen.getByText('Clickable');
    badge.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as div element', () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.firstChild;
    expect(badge?.nodeName).toBe('DIV');
  });
});
