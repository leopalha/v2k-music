import type { Track } from "@/components/tracks";

// Generate mock track data
function generateMockTracks(): Track[] {
  const artists = [
    "MC Kevinho",
    "Anitta",
    "Luísa Sonza",
    "Veigh",
    "Matuê",
    "WIU",
    "L7NNON",
    "Djonga",
    "Xamã",
    "Poze do Rodo",
    "MC Ryan SP",
    "MC Cabelinho",
    "Ludmilla",
    "Gloria Groove",
    "Pabllo Vittar",
    "Jão",
    "Luan Santana",
    "Gusttavo Lima",
    "Jorge & Mateus",
    "Henrique & Juliano",
  ];

  const genres = ["Trap", "Funk", "Rap", "R&B", "Reggaeton", "Pop", "Sertanejo", "Eletrônica"];

  const titlePrefixes = [
    "Modo",
    "Só",
    "Ela",
    "Eu",
    "Vem",
    "Bota",
    "Tá",
    "Faz",
    "Me",
    "Tu",
  ];

  const titleSuffixes = [
    "Turbo",
    "Quer Paz",
    "Comigo",
    "Demais",
    "Pro Baile",
    "Na Onda",
    "Tá On",
    "No Beat",
    "Milionário",
    "Brabo",
    "de Ouro",
    "sem Limites",
    "Explosivo",
    "do Momento",
    "Viral",
  ];

  const riskLevels: ("LOW" | "MEDIUM" | "HIGH")[] = ["LOW", "MEDIUM", "HIGH"];

  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-orange-500 to-red-500",
    "from-green-500 to-teal-500",
    "from-indigo-500 to-purple-500",
    "from-yellow-500 to-orange-500",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-green-500",
    "from-violet-500 to-indigo-500",
  ];

  const tracks: Track[] = [];

  for (let i = 1; i <= 50; i++) {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
    const suffix = titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];

    // Generate realistic-ish values
    const pricePerToken = parseFloat((Math.random() * 9 + 1).toFixed(2)); // R$ 1-10
    const currentROI = parseFloat((Math.random() * 60 - 10).toFixed(1)); // -10% to +50%
    const totalTokens = 10000;
    const soldPercent = Math.random() * 0.7 + 0.1; // 10-80% sold
    const availableTokens = Math.floor(totalTokens * (1 - soldPercent));

    tracks.push({
      id: `track-${i}`,
      title: `${prefix} ${suffix}`,
      artist,
      coverArt: "", // Empty = will use gradient fallback
      genre,
      pricePerToken,
      currentROI,
      riskLevel,
      totalTokens,
      availableTokens,
      isFavorite: Math.random() > 0.8, // 20% chance of being favorited
      previewUrl: undefined,
    });
  }

  // Sort by ROI (trending first)
  return tracks.sort((a, b) => b.currentROI - a.currentROI);
}

export const mockTracks = generateMockTracks();

// Extended track detail type
export interface TrackDetail extends Track {
  description: string;
  releaseDate: string;
  duration: string;
  isrc: string;
  totalInvestors: number;
  totalInvested: number;
  totalStreamsLast30Days: number;
  totalRoyaltiesLast30Days: number;
  avgRoyaltyPerToken: number;
  royaltyBreakdown: {
    spotify: number;
    youtube: number;
    appleMusic: number;
    other: number;
  };
  priceHistory: Array<{ date: string; price: number }>;
}

// Generate price history for a track
function generatePriceHistory(basePrice: number, days: number = 90): Array<{ date: string; price: number }> {
  const history: Array<{ date: string; price: number }> = [];
  let currentPrice = basePrice * 0.7; // Start at 70% of current price

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Random walk with slight upward bias
    const change = (Math.random() - 0.45) * 0.05;
    currentPrice = Math.max(0.5, currentPrice * (1 + change));

    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }

  // Ensure last price matches current price
  if (history.length > 0) {
    history[history.length - 1].price = basePrice;
  }

  return history;
}

// Get track detail by ID
export function getTrackById(id: string): TrackDetail | null {
  const track = mockTracks.find((t) => t.id === id);
  if (!track) return null;

  // Generate extended data
  const totalInvestors = Math.floor(Math.random() * 500) + 50;
  const totalInvested = (track.totalTokens - track.availableTokens) * track.pricePerToken;
  const totalStreamsLast30Days = Math.floor(Math.random() * 5000000) + 100000;
  const totalRoyaltiesLast30Days = totalStreamsLast30Days * 0.003; // ~R$0.003 per stream
  const avgRoyaltyPerToken = totalRoyaltiesLast30Days / track.totalTokens;

  return {
    ...track,
    description: `${track.title} é uma das faixas mais promissoras de ${track.artist}. Com batidas envolventes e letras marcantes, a música tem conquistado cada vez mais ouvintes nas principais plataformas de streaming.`,
    releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: `${Math.floor(Math.random() * 2) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    isrc: `BR${Math.random().toString(36).substring(2, 5).toUpperCase()}${Math.floor(Math.random() * 9000000) + 1000000}`,
    totalInvestors,
    totalInvested,
    totalStreamsLast30Days,
    totalRoyaltiesLast30Days,
    avgRoyaltyPerToken,
    royaltyBreakdown: {
      spotify: 45 + Math.floor(Math.random() * 10),
      youtube: 25 + Math.floor(Math.random() * 10),
      appleMusic: 10 + Math.floor(Math.random() * 10),
      other: 5 + Math.floor(Math.random() * 5),
    },
    priceHistory: generatePriceHistory(track.pricePerToken),
  };
}

// Get similar tracks
export function getSimilarTracks(trackId: string, limit: number = 4): Track[] {
  const track = mockTracks.find((t) => t.id === trackId);
  if (!track) return [];

  // Find tracks with same genre or artist
  return mockTracks
    .filter((t) => t.id !== trackId && (t.genre === track.genre || t.artist === track.artist))
    .slice(0, limit);
}

// Filter and sort functions
export function filterTracks(
  tracks: Track[],
  filters: {
    genres?: string[];
    minPrice?: number;
    maxPrice?: number;
    minROI?: number | null;
    riskLevels?: ("LOW" | "MEDIUM" | "HIGH")[];
    search?: string;
    sortBy?: "popular" | "newest" | "price_asc" | "price_desc" | "roi" | "name";
  }
): Track[] {
  let result = [...tracks];

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (track) =>
        track.title.toLowerCase().includes(searchLower) ||
        track.artist.toLowerCase().includes(searchLower) ||
        track.genre.toLowerCase().includes(searchLower)
    );
  }

  // Filter by genres
  if (filters.genres && filters.genres.length > 0) {
    result = result.filter((track) => filters.genres!.includes(track.genre));
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    result = result.filter((track) => track.pricePerToken >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((track) => track.pricePerToken <= filters.maxPrice!);
  }

  // Filter by ROI
  if (filters.minROI !== null && filters.minROI !== undefined) {
    result = result.filter((track) => track.currentROI >= filters.minROI!);
  }

  // Filter by risk level
  if (filters.riskLevels && filters.riskLevels.length > 0) {
    result = result.filter((track) =>
      filters.riskLevels!.includes(track.riskLevel)
    );
  }

  // Sort
  switch (filters.sortBy) {
    case "newest":
      // In real app, would sort by createdAt
      result = result.reverse();
      break;
    case "price_asc":
      result = result.sort((a, b) => a.pricePerToken - b.pricePerToken);
      break;
    case "price_desc":
      result = result.sort((a, b) => b.pricePerToken - a.pricePerToken);
      break;
    case "roi":
      result = result.sort((a, b) => b.currentROI - a.currentROI);
      break;
    case "name":
      result = result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "popular":
    default:
      // Sort by sold percentage (most invested)
      result = result.sort((a, b) => {
        const soldA = (a.totalTokens - a.availableTokens) / a.totalTokens;
        const soldB = (b.totalTokens - b.availableTokens) / b.totalTokens;
        return soldB - soldA;
      });
      break;
  }

  return result;
}
