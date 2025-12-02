# V2K Music Platform - API Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-12-02  
**Base URL:** `https://v2k-music.com/api`

## Table of Contents

1. [Authentication](#authentication)
2. [REST API Endpoints](#rest-api-endpoints)
3. [GraphQL API](#graphql-api)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#error-handling)
6. [Webhooks](#webhooks)

---

## Authentication

### Session Authentication (Web)
Uses NextAuth.js for web application authentication.

### API Key Authentication (Developers)
For programmatic access, use API keys:

```http
Authorization: Bearer YOUR_API_KEY
```

Generate API keys at `/developer/api-docs`.

---

## REST API Endpoints

### Tracks

#### GET /api/tracks
List all tracks with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `genre` (string): Filter by genre
- `sortBy` (string): Sort field (price, volume, created)
- `order` (string): asc | desc
- `search` (string): Search by title or artist

**Response:**
```json
{
  "tracks": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### GET /api/tracks/[id]
Get track details by ID.

**Response:**
```json
{
  "id": "track_123",
  "title": "Summer Vibes",
  "artistName": "Artist Name",
  "currentPrice": 1.50,
  "priceChange24h": 5.2,
  "volume24h": 15000,
  ...
}
```

### Portfolio

#### GET /api/portfolio
Get user's portfolio holdings (requires auth).

**Response:**
```json
{
  "holdings": [...],
  "totalValue": 50000,
  "totalInvested": 45000,
  "unrealizedPnL": 5000,
  "unclaimedRoyalties": 250
}
```

### Transactions

#### GET /api/transactions
Get user's transaction history (requires auth).

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`: BUY | SELL | ROYALTY_CLAIM
- `trackId`: Filter by track

#### POST /api/investments/create
Create a trade (buy/sell).

**Body:**
```json
{
  "trackId": "track_123",
  "type": "BUY",
  "amount": 100,
  "price": 1.50
}
```

### Alerts

#### GET /api/alerts
List user's price alerts (requires auth).

#### POST /api/alerts
Create a price alert.

**Body:**
```json
{
  "trackId": "track_123",
  "condition": "ABOVE",
  "targetPrice": 2.00
}
```

### Analytics

#### GET /api/analytics/overview
Platform-wide analytics (admin only).

#### GET /api/analytics/rfm
RFM segmentation analysis (admin only).

### Developer APIs

#### GET /api/developer/keys
List API keys (requires auth).

#### POST /api/developer/keys
Create new API key.

**Body:**
```json
{
  "name": "My Integration",
  "permissions": ["READ_ONLY"],
  "environment": "PRODUCTION"
}
```

---

## GraphQL API

**Endpoint:** `/api/graphql`  
**Playground:** Available in development mode

### Schema Overview

```graphql
type Query {
  # User
  me: User
  user(id: ID!): User
  
  # Tracks
  track(id: ID!): Track
  tracks(filter: TracksFilterInput): TracksConnection!
  trendingTracks(limit: Int): [Track!]!
  
  # Portfolio
  portfolio: Portfolio!
  userPortfolio(userId: ID!): Portfolio
  
  # Transactions
  transactions(filter: TransactionsFilterInput): TransactionsConnection!
  
  # Alerts
  alerts: [Alert!]!
  
  # Stats
  platformStats: PlatformStats!
}

type Mutation {
  # Trading
  createTrade(input: CreateTradeInput!): Transaction!
  
  # Alerts
  createAlert(input: CreateAlertInput!): Alert!
  cancelAlert(id: ID!): Boolean!
  
  # Profile
  updateProfile(input: UpdateProfileInput!): User!
}
```

### Example Query

```graphql
query GetTrendingTracks {
  trendingTracks(limit: 5) {
    id
    title
    artistName
    currentPrice
    priceChange24h
    volume24h
  }
}
```

### Example Mutation

```graphql
mutation CreateTrade {
  createTrade(input: {
    trackId: "track_123"
    type: BUY
    amount: 100
  }) {
    id
    status
    totalValue
  }
}
```

---

## Rate Limiting

- **Anonymous:** 60 requests/minute
- **Authenticated:** 300 requests/minute
- **API Keys:** Based on plan (1000-10000/min)

**Headers:**
- `X-RateLimit-Limit`: Total limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

---

## Error Handling

### HTTP Status Codes

- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `429` Too Many Requests
- `500` Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "amount",
      "issue": "Must be greater than 0"
    }
  }
}
```

---

## Webhooks

Configure webhooks to receive real-time events.

**Endpoint:** `/api/webhooks`

### Event Types
- `trade.completed`
- `trade.failed`
- `alert.triggered`
- `royalty.claimed`
- `portfolio.updated`
- `user.kyc.approved`
- `user.kyc.rejected`

### Webhook Payload

```json
{
  "event": "trade.completed",
  "timestamp": "2025-12-02T12:00:00Z",
  "data": {
    "tradeId": "tx_123",
    "userId": "user_456",
    "trackId": "track_789",
    "type": "BUY",
    "amount": 100,
    "price": 1.50,
    "totalValue": 150.00
  }
}
```

### Signature Verification

Verify webhook authenticity using HMAC SHA256:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## SDK

Official TypeScript SDK available:

```typescript
import { V2KClient } from '@v2k/sdk';

const client = new V2KClient({
  apiKey: 'sk_live_...',
  baseUrl: 'https://v2k-music.com'
});

// Get trending tracks
const tracks = await client.getTrendingTracks(10);

// Create trade
const trade = await client.createTrade({
  trackId: 'track_123',
  type: 'BUY',
  amount: 100
});
```

---

## Support

- **Documentation:** https://v2k-music.com/docs
- **Developer Portal:** https://v2k-music.com/developer
- **Email:** dev@v2k-music.com
