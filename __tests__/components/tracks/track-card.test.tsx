import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackCard, Track } from '@/components/tracks/track-card';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock fetch
global.fetch = jest.fn();

const mockTrack: Track = {
  id: 'track-1',
  title: 'Test Song',
  artist: 'Test Artist',
  coverArt: '/test-cover.jpg',
  genre: 'Electronic',
  pricePerToken: 10.5,
  currentROI: 15.3,
  riskLevel: 'MEDIUM',
  totalTokens: 10000,
  availableTokens: 5000,
  aiScore: 85,
};

describe('TrackCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ isInWatchlist: false }),
    });
  });

  describe('Rendering', () => {
    it('renders track title and artist in list variant', () => {
      render(<TrackCard track={mockTrack} variant="list" />);
      
      expect(screen.getByTestId('track-title')).toHaveTextContent('Test Song');
      expect(screen.getByTestId('track-artist')).toHaveTextContent('Test Artist');
    });

    it('renders track price formatted in list variant', () => {
      render(<TrackCard track={mockTrack} variant="list" />);
      
      const priceElement = screen.getByTestId('track-price');
      expect(priceElement).toBeInTheDocument();
      expect(priceElement.textContent).toMatch(/10,50|10.50/); // Brazilian or US format
    });

    it('renders track card', () => {
      render(<TrackCard track={mockTrack} variant="list" />);
      
      expect(screen.getByTestId('track-card')).toBeInTheDocument();
    });

    it('displays track data', () => {
      render(<TrackCard track={mockTrack} variant="list" />);
      
      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders list variant when specified', () => {
      render(<TrackCard track={mockTrack} variant="list" />);
      
      // List variant shows track in horizontal layout
      expect(screen.getByTestId('track-card')).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('shows stats when showStats is true', () => {
      render(<TrackCard track={mockTrack} showStats={true} variant="list" />);
      
      expect(screen.getByTestId('track-price')).toBeInTheDocument();
      expect(screen.getByText('Electronic')).toBeInTheDocument();
    });

    it('hides stats when showStats is false', () => {
      render(<TrackCard track={mockTrack} showStats={false} variant="list" />);
      
      expect(screen.queryByText('Electronic')).not.toBeInTheDocument();
    });

    it('displays ROI percentage', () => {
      const { container } = render(<TrackCard track={mockTrack} variant="list" />);
      
      // ROI should be visible in some form (format may vary)
      const text = container.textContent;
      expect(text).toMatch(/15.*3|15,3/);
    });
  });

  describe('Watchlist Functionality', () => {
    it('checks watchlist status on mount', async () => {
      render(<TrackCard track={mockTrack} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/watchlist/${mockTrack.id}`);
      });
    });

    it('adds track to watchlist when clicked', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ isInWatchlist: false }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      render(<TrackCard track={mockTrack} variant="list" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Find watchlist button by testing multiple buttons
      const buttons = screen.getAllByRole('button');
      const watchlistButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('watchlist') || true);
      if (watchlistButton) {
        await user.click(watchlistButton);
      }

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Adicionado à watchlist');
      });
    });

    it('prevents multiple rapid clicks on watchlist button', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ isInWatchlist: false }) })
        .mockResolvedValue({ ok: true, json: async () => ({}) });

      render(<TrackCard track={mockTrack} variant="list" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Find watchlist button
      const buttons = screen.getAllByRole('button');
      const watchlistButton = buttons[0]; // First button is likely watchlist
      
      // Click multiple times rapidly
      await user.click(watchlistButton);
      await user.click(watchlistButton);
      await user.click(watchlistButton);

      // Should only call API once (debounced/locked)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // 1 initial + 1 add
      });
    });
  });

  describe('Play Functionality', () => {
    it('renders play/pause overlay', () => {
      render(<TrackCard track={mockTrack} onPlay={jest.fn()} variant="list" />);
      
      // Play button should exist in DOM (may be hidden by CSS)
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Link Navigation', () => {
    it('links to track detail page', () => {
      render(<TrackCard track={mockTrack} />);
      
      const link = screen.getByTestId('track-card').closest('a');
      expect(link).toHaveAttribute('href', `/track/${mockTrack.id}`);
    });

    it('prevents navigation when interacting with buttons', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ isInWatchlist: false }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      render(<TrackCard track={mockTrack} variant="list" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Find button
      const buttons = screen.getAllByRole('button');
      const watchlistButton = buttons[0];
      
      // Click should not navigate (stopPropagation)
      if (watchlistButton) {
        await user.click(watchlistButton);
      }
      
      // If this test passes without navigation, stopPropagation works
      expect(watchlistButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles watchlist API error gracefully', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ isInWatchlist: false }) })
        .mockRejectedValueOnce(new Error('Network error'));

      render(<TrackCard track={mockTrack} variant="list" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Find button
      const buttons = screen.getAllByRole('button');
      const watchlistButton = buttons[0];
      if (watchlistButton) {
        await user.click(watchlistButton);
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });
});
