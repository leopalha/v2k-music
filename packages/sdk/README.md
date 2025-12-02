# @v2k/sdk

Official TypeScript/JavaScript SDK for V2K Music Platform.

## Installation

```bash
npm install @v2k/sdk
```

## Quick Start

```typescript
import V2KClient from '@v2k/sdk';

const client = new V2KClient({
  apiKey: 'sk_live_your_api_key_here',
  baseUrl: 'https://v2k-music.com', // optional
});

// Get trending tracks
const tracks = await client.getTrendingTracks(10);

// Get your portfolio
const portfolio = await client.getPortfolio();

// Create a trade
const trade = await client.createTrade({
  trackId: 'track_id_here',
  type: 'BUY',
  quantity: 10,
});
```

## API Reference

### Tracks

#### `getTracks(filter?)`
List all tracks with optional filtering.

```typescript
const result = await client.getTracks({
  genre: 'pop',
  search: 'artist name',
  page: 1,
  limit: 20,
});
```

#### `getTrack(id)`
Get details of a specific track.

```typescript
const track = await client.getTrack('track_id');
```

#### `getTrendingTracks(limit?)`
Get trending tracks.

```typescript
const trending = await client.getTrendingTracks(10);
```

### Portfolio

#### `getPortfolio()`
Get your portfolio with all holdings.

```typescript
const portfolio = await client.getPortfolio();
console.log(portfolio.totalValue); // Total portfolio value
console.log(portfolio.unrealizedPnL); // Unrealized profit/loss
```

### Trading

#### `createTrade(input)`
Create a new trade (buy or sell).

```typescript
const trade = await client.createTrade({
  trackId: 'track_id',
  type: 'BUY', // or 'SELL'
  quantity: 10,
});
```

#### `getTransactions(filter?)`
Get transaction history.

```typescript
const transactions = await client.getTransactions({
  type: 'BUY',
  page: 1,
  limit: 20,
});
```

### Alerts

#### `createAlert(input)`
Create a price alert.

```typescript
const alert = await client.createAlert({
  trackId: 'track_id',
  targetPrice: 100.0,
  condition: 'ABOVE', // or 'BELOW'
});
```

#### `getAlerts()`
Get all your alerts.

```typescript
const alerts = await client.getAlerts();
```

#### `cancelAlert(id)`
Cancel an alert.

```typescript
await client.cancelAlert('alert_id');
```

### User

#### `getMe()`
Get your user profile and stats.

```typescript
const me = await client.getMe();
console.log(me.level); // User level
console.log(me.stats.totalTrades); // Total trades
```

#### `updateProfile(input)`
Update your profile.

```typescript
await client.updateProfile({
  name: 'New Name',
  username: 'newusername',
  bio: 'New bio',
});
```

### Stats

#### `getPlatformStats()`
Get platform-wide statistics.

```typescript
const stats = await client.getPlatformStats();
console.log(stats.totalUsers);
console.log(stats.totalVolume);
```

## Error Handling

```typescript
try {
  const trade = await client.createTrade({
    trackId: 'invalid_id',
    type: 'BUY',
    quantity: 10,
  });
} catch (error) {
  console.error('Trade failed:', error.message);
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions.

```typescript
import V2KClient, { Track, Portfolio, Transaction } from '@v2k/sdk';

const client = new V2KClient({ apiKey: 'sk_live_...' });

// Types are automatically inferred
const portfolio: Portfolio = await client.getPortfolio();
```

## License

MIT
