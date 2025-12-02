export const typeDefs = `#graphql
  # User type
  type User {
    id: ID!
    name: String!
    email: String!
    username: String
    profileImageUrl: String
    level: Int!
    xp: Int!
    role: UserRole!
    kycStatus: KYCStatus!
    portfolio: Portfolio
    stats: UserStats!
    createdAt: String!
  }

  type UserStats {
    totalTrades: Int!
    totalInvested: Float!
    totalProfit: Float!
    winRate: Float!
    followersCount: Int!
    followingCount: Int!
  }

  enum UserRole {
    USER
    ADMIN
    SUPER_ADMIN
  }

  enum KYCStatus {
    PENDING
    SUBMITTED
    VERIFIED
    REJECTED
  }

  # Track type
  type Track {
    id: ID!
    title: String!
    artist: String!
    genre: String!
    coverUrl: String
    audioUrl: String
    currentPrice: Float!
    previousPrice: Float!
    priceChange24h: Float!
    totalSupply: Int!
    availableSupply: Int!
    holders: Int!
    volume24h: Float!
    marketCap: Float!
    aiScore: Float
    streamCount: Int!
    releaseDate: String
    isActive: Boolean!
    createdAt: String!
  }

  # Portfolio type
  type Portfolio {
    userId: ID!
    holdings: [Holding!]!
    totalValue: Float!
    totalInvested: Float!
    unrealizedPnL: Float!
    unrealizedPnLPercent: Float!
    unclaimedRoyalties: Float!
    holdingsCount: Int!
  }

  type Holding {
    id: ID!
    track: Track!
    quantity: Int!
    averagePrice: Float!
    currentValue: Float!
    investedAmount: Float!
    unrealizedPnL: Float!
    unrealizedPnLPercent: Float!
  }

  # Transaction type
  type Transaction {
    id: ID!
    userId: ID!
    user: User!
    trackId: ID!
    track: Track!
    type: TransactionType!
    amount: Float!
    quantity: Int!
    price: Float!
    status: TransactionStatus!
    createdAt: String!
  }

  enum TransactionType {
    BUY
    SELL
  }

  enum TransactionStatus {
    PENDING
    COMPLETED
    FAILED
    CANCELLED
  }

  # Alert type
  type Alert {
    id: ID!
    userId: ID!
    trackId: ID!
    track: Track!
    targetPrice: Float!
    condition: AlertCondition!
    status: AlertStatus!
    triggeredAt: String
    createdAt: String!
  }

  enum AlertCondition {
    ABOVE
    BELOW
  }

  enum AlertStatus {
    ACTIVE
    TRIGGERED
    CANCELLED
  }

  # Pagination
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    page: Int!
    totalPages: Int!
    totalItems: Int!
  }

  type TracksConnection {
    items: [Track!]!
    pageInfo: PageInfo!
  }

  type TransactionsConnection {
    items: [Transaction!]!
    pageInfo: PageInfo!
  }

  # Inputs
  input TracksFilterInput {
    genre: String
    search: String
    minPrice: Float
    maxPrice: Float
    sortBy: TrackSortField
    order: SortOrder
    page: Int
    limit: Int
  }

  enum TrackSortField {
    PRICE
    PRICE_CHANGE
    VOLUME
    MARKET_CAP
    CREATED_AT
  }

  enum SortOrder {
    ASC
    DESC
  }

  input TransactionsFilterInput {
    type: TransactionType
    trackId: ID
    startDate: String
    endDate: String
    page: Int
    limit: Int
  }

  input CreateTradeInput {
    trackId: ID!
    type: TransactionType!
    quantity: Int!
  }

  input CreateAlertInput {
    trackId: ID!
    targetPrice: Float!
    condition: AlertCondition!
  }

  input UpdateProfileInput {
    name: String
    username: String
    bio: String
  }

  # Queries
  type Query {
    # User queries
    me: User
    user(id: ID!): User

    # Track queries
    track(id: ID!): Track
    tracks(filter: TracksFilterInput): TracksConnection!
    trendingTracks(limit: Int): [Track!]!

    # Portfolio queries
    portfolio: Portfolio
    userPortfolio(userId: ID!): Portfolio

    # Transaction queries
    transactions(filter: TransactionsFilterInput): TransactionsConnection!
    transaction(id: ID!): Transaction

    # Alert queries
    alerts: [Alert!]!
    alert(id: ID!): Alert

    # Stats
    platformStats: PlatformStats!
  }

  type PlatformStats {
    totalUsers: Int!
    totalTracks: Int!
    totalTransactions: Int!
    totalVolume: Float!
    activeUsers24h: Int!
  }

  # Mutations
  type Mutation {
    # Trading
    createTrade(input: CreateTradeInput!): Transaction!

    # Alerts
    createAlert(input: CreateAlertInput!): Alert!
    cancelAlert(id: ID!): Alert!

    # Profile
    updateProfile(input: UpdateProfileInput!): User!
  }
`;
