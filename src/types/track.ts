export interface Track {
  id: string;
  tokenId?: number;
  title: string;
  artist: string;
  genre: string;
  coverArt: string;
  audioUrl?: string;
  pricePerToken: number;
  // Both naming conventions for compatibility
  totalSupply?: number;
  availableSupply?: number;
  totalTokens: number;
  availableTokens: number;
  currentROI: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  previewUrl?: string;
  isFavorite?: boolean;
  totalStreams?: number;
  monthlyRoyalty?: number;
}
