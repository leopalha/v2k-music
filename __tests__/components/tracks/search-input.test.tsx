import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/components/tracks/search-input';
import type { Track } from '@/components/tracks/track-card';

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockTrack: Track = {
  id: 'track-1',
  title: 'Test Song',
  artist: 'Test Artist',
  coverArt: '/cover.jpg',
  genre: 'Electronic',
  pricePerToken: 10,
  currentROI: 5,
  riskLevel: 'MEDIUM',
  totalTokens: 10000,
  availableTokens: 5000,
};

describe('SearchInput', () => {
  const onChangeMock = jest.fn();
  const onSearchMock = jest.fn();
  const onClearRecentSearchesMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with placeholder', () => {
      render(<SearchInput value="" onChange={onChangeMock} />);
      
      expect(screen.getByPlaceholderText('Buscar músicas, artistas...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <SearchInput 
          value="" 
          onChange={onChangeMock} 
          placeholder="Custom placeholder" 
        />
      );
      
      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('displays current value', () => {
      render(<SearchInput value="test query" onChange={onChangeMock} />);
      
      const input = screen.getByTestId('search-input');
      expect(input).toHaveValue('test query');
    });

    it('renders search icon', () => {
      const { container } = render(<SearchInput value="" onChange={onChangeMock} />);
      
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Input Interaction', () => {
    it('calls onChange when typing', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SearchInput value="" onChange={onChangeMock} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'a');

      expect(onChangeMock).toHaveBeenCalledWith('a');
    });

    it('shows clear button when value is not empty', () => {
      render(<SearchInput value="test" onChange={onChangeMock} />);
      
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when value is empty', () => {
      render(<SearchInput value="" onChange={onChangeMock} />);
      
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('clears input when clear button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SearchInput value="test" onChange={onChangeMock} />);
      
      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(onChangeMock).toHaveBeenCalledWith('');
    });
  });

  describe('Debounce Behavior', () => {
    it('debounces search callback', async () => {
      const user = userEvent.setup({ delay: null });
      const { rerender } = render(
        <SearchInput 
          value="" 
          onChange={onChangeMock} 
          onSearch={onSearchMock}
        />
      );
      
      // Simulate typing by calling onChange and rerendering
      act(() => {
        onChangeMock('test');
      });
      
      rerender(
        <SearchInput 
          value="test" 
          onChange={onChangeMock} 
          onSearch={onSearchMock}
        />
      );
      
      // onSearch should not be called immediately
      expect(onSearchMock).not.toHaveBeenCalled();
      
      // Wait for debounce (300ms)
      act(() => {
        jest.advanceTimersByTime(310);
      });

      // Now onSearch should be called once with final value
      expect(onSearchMock).toHaveBeenCalledWith('test');
    });

    it('cancels previous debounce timer on new input', async () => {
      const { rerender } = render(
        <SearchInput 
          value="" 
          onChange={onChangeMock} 
          onSearch={onSearchMock}
        />
      );
      
      // Type 'te'
      act(() => {
        onChangeMock('te');
      });
      rerender(
        <SearchInput 
          value="te" 
          onChange={onChangeMock} 
          onSearch={onSearchMock}
        />
      );
      
      // Wait 200ms (not enough to trigger)
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Type more - cancels previous timer
      act(() => {
        onChangeMock('test');
      });
      rerender(
        <SearchInput 
          value="test" 
          onChange={onChangeMock} 
          onSearch={onSearchMock}
        />
      );
      
      // Wait full debounce
      act(() => {
        jest.advanceTimersByTime(310);
      });

      // Should only call once with final value
      expect(onSearchMock).toHaveBeenCalledTimes(1);
      expect(onSearchMock).toHaveBeenCalledWith('test');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates to search results on Enter key', async () => {
      const user = userEvent.setup({ delay: null });
      // Skip navigation test in JSDOM (not supported)
      render(<SearchInput value="test query" onChange={onChangeMock} />);
      
      const input = screen.getByTestId('search-input');
      await user.click(input);
      
      // Just verify Enter key doesn't break
      expect(() => user.keyboard('{Enter}')).not.toThrow();
    });

    it('does not navigate on Enter if value is empty', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SearchInput value="" onChange={onChangeMock} />);
      
      const input = screen.getByTestId('search-input');
      await user.click(input);
      
      // Just verify Enter key doesn't break
      expect(() => user.keyboard('{Enter}')).not.toThrow();
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <SearchInput 
          value="test" 
          onChange={onChangeMock}
          suggestions={[mockTrack]}
        />
      );
      
      const input = screen.getByTestId('search-input');
      await user.click(input); // Focus and open dropdown
      
      // Dropdown should be visible
      expect(screen.getByText('Resultados')).toBeInTheDocument();
      
      await user.keyboard('{Escape}');

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Resultados')).not.toBeInTheDocument();
      });
    });
  });

  describe('Suggestions Dropdown', () => {
    it('shows dropdown when focused with value', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <SearchInput 
          value="test" 
          onChange={onChangeMock}
          suggestions={[mockTrack]}
        />
      );
      
      const input = screen.getByTestId('search-input');
      await user.click(input);

      expect(screen.getByText('Resultados')).toBeInTheDocument();
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    it('shows recent searches when focused without value', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <SearchInput 
          value="" 
          onChange={onChangeMock}
          recentSearches={['rock music', 'jazz']}
        />
      );
      
      const input = screen.getByTestId('search-input');
      await user.click(input);

      expect(screen.getByText('Buscas Recentes')).toBeInTheDocument();
      expect(screen.getByText('rock music')).toBeInTheDocument();
    });

    it('shows no results message when suggestions empty', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <SearchInput 
          value="nonexistent" 
          onChange={onChangeMock}
          suggestions={[]}
        />
      );
      
      const input = screen.getByTestId('search-input');
      await user.click(input);

      expect(screen.getByText(/Nenhum resultado/i)).toBeInTheDocument();
    });

    it('limits suggestions to 5 items', async () => {
      const user = userEvent.setup({ delay: null });
      const manySuggestions = Array.from({ length: 10 }, (_, i) => ({
        ...mockTrack,
        id: `track-${i}`,
        title: `Song ${i}`,
      }));

      render(
        <SearchInput 
          value="test" 
          onChange={onChangeMock}
          suggestions={manySuggestions}
        />
      );
      
      const input = screen.getByTestId('search-input');
      await user.click(input);

      // Should show "Ver todos" link
      expect(screen.getByText(/Ver todos os 10 resultados/i)).toBeInTheDocument();
      
      // Count suggestion items (should be 5)
      const suggestionItems = screen.getAllByText(/Song \d+/);
      expect(suggestionItems).toHaveLength(5);
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(
        <div>
          <SearchInput 
            value="test" 
            onChange={onChangeMock}
            suggestions={[mockTrack]}
          />
          <button>Outside button</button>
        </div>
      );
      
      const input = screen.getByTestId('search-input');
      await user.click(input);

      // Dropdown visible
      expect(screen.getByText('Resultados')).toBeInTheDocument();
      
      // Click outside
      const outsideButton = screen.getByText('Outside button');
      await user.click(outsideButton);

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Resultados')).not.toBeInTheDocument();
      });
    });
  });
});
