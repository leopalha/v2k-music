/**
 * V2K Music SDK
 * Official TypeScript/JavaScript SDK for V2K Music Platform
 */

export interface V2KClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  currentPrice: number;
  priceChange24h: number;
  holders: number;
  volume24h: number;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  totalInvested: number;
  unrealizedPnL: number;
  unclaimedRoyalties: number;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  track: Track;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  unrealizedPnL: number;
}

export interface Transaction {
  id: string;
  trackId: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  amount: number;
  status: string;
  createdAt: string;
}

export class V2KClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: V2KClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://v2k-music.com';
  }

  private async request(query: string, variables?: Record<string, any>) {
    const response = await fetch(`${this.baseUrl}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    return json.data;
  }

  // Tracks methods
  async getTracks(filter?: {
    genre?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = `
      query GetTracks($filter: TracksFilterInput) {
        tracks(filter: $filter) {
          items {
            id
            title
            artist
            genre
            currentPrice
            priceChange24h
            holders
            volume24h
          }
          pageInfo {
            page
            totalPages
            totalItems
            hasNextPage
          }
        }
      }
    `;

    const data = await this.request(query, { filter });
    return data.tracks;
  }

  async getTrack(id: string) {
    const query = `
      query GetTrack($id: ID!) {
        track(id: $id) {
          id
          title
          artist
          genre
          coverUrl
          currentPrice
          previousPrice
          priceChange24h
          totalSupply
          availableSupply
          holders
          volume24h
          marketCap
          aiScore
          streamCount
        }
      }
    `;

    const data = await this.request(query, { id });
    return data.track;
  }

  async getTrendingTracks(limit = 10) {
    const query = `
      query GetTrendingTracks($limit: Int) {
        trendingTracks(limit: $limit) {
          id
          title
          artist
          genre
          currentPrice
          priceChange24h
          volume24h
        }
      }
    `;

    const data = await this.request(query, { limit });
    return data.trendingTracks;
  }

  // Portfolio methods
  async getPortfolio(): Promise<Portfolio> {
    const query = `
      query GetPortfolio {
        portfolio {
          userId
          totalValue
          totalInvested
          unrealizedPnL
          unrealizedPnLPercent
          unclaimedRoyalties
          holdingsCount
          holdings {
            id
            quantity
            averagePrice
            currentValue
            unrealizedPnL
            track {
              id
              title
              artist
              currentPrice
            }
          }
        }
      }
    `;

    const data = await this.request(query);
    return data.portfolio;
  }

  // Trading methods
  async createTrade(input: {
    trackId: string;
    type: 'BUY' | 'SELL';
    quantity: number;
  }): Promise<Transaction> {
    const query = `
      mutation CreateTrade($input: CreateTradeInput!) {
        createTrade(input: $input) {
          id
          trackId
          type
          quantity
          price
          amount
          status
          createdAt
        }
      }
    `;

    const data = await this.request(query, { input });
    return data.createTrade;
  }

  async getTransactions(filter?: {
    type?: 'BUY' | 'SELL';
    trackId?: string;
    page?: number;
    limit?: number;
  }) {
    const query = `
      query GetTransactions($filter: TransactionsFilterInput) {
        transactions(filter: $filter) {
          items {
            id
            trackId
            type
            quantity
            price
            amount
            status
            createdAt
            track {
              title
              artist
            }
          }
          pageInfo {
            page
            totalPages
            totalItems
          }
        }
      }
    `;

    const data = await this.request(query, { filter });
    return data.transactions;
  }

  // Alerts methods
  async createAlert(input: {
    trackId: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
  }) {
    const query = `
      mutation CreateAlert($input: CreateAlertInput!) {
        createAlert(input: $input) {
          id
          trackId
          targetPrice
          condition
          status
          createdAt
        }
      }
    `;

    const data = await this.request(query, { input });
    return data.createAlert;
  }

  async getAlerts() {
    const query = `
      query GetAlerts {
        alerts {
          id
          trackId
          targetPrice
          condition
          status
          createdAt
          track {
            title
            artist
            currentPrice
          }
        }
      }
    `;

    const data = await this.request(query);
    return data.alerts;
  }

  async cancelAlert(id: string) {
    const query = `
      mutation CancelAlert($id: ID!) {
        cancelAlert(id: $id) {
          id
          status
        }
      }
    `;

    const data = await this.request(query, { id });
    return data.cancelAlert;
  }

  // Stats methods
  async getPlatformStats() {
    const query = `
      query GetPlatformStats {
        platformStats {
          totalUsers
          totalTracks
          totalTransactions
          totalVolume
          activeUsers24h
        }
      }
    `;

    const data = await this.request(query);
    return data.platformStats;
  }

  // User methods
  async getMe() {
    const query = `
      query GetMe {
        me {
          id
          name
          email
          username
          level
          xp
          role
          kycStatus
          stats {
            totalTrades
            totalInvested
            totalProfit
            winRate
            followersCount
            followingCount
          }
        }
      }
    `;

    const data = await this.request(query);
    return data.me;
  }

  async updateProfile(input: {
    name?: string;
    username?: string;
    bio?: string;
  }) {
    const query = `
      mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
          id
          name
          username
        }
      }
    `;

    const data = await this.request(query, { input });
    return data.updateProfile;
  }
}

export default V2KClient;
