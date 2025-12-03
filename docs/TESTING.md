# Testing Guide - V2K Music Platform

## 📋 Overview

This document describes the testing strategy, patterns, and best practices for the V2K Music platform.

## 🧪 Testing Stack

- **Unit/Integration Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Database:** Railway PostgreSQL (test data namespaced with `@v2k.test`)
- **Mocking:** Jest mocks + custom test helpers

## 📁 Test Structure

```
v2k-app/
├── __tests__/
│   ├── api/                  # API route tests
│   ├── components/           # Component tests
│   ├── lib/                  # Library/utility tests
│   ├── security/             # Security tests
│   └── helpers/              # Test utilities
│       ├── factories.ts      # Data factories
│       ├── mocks.ts          # Mock functions
│       └── test-db.ts        # Database helpers
├── e2e/                      # Playwright E2E tests
└── jest.setup.ts             # Jest global setup
```

## 🚀 Running Tests

### Unit/Integration Tests (Jest)
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

## 🏭 Test Factories

Located in `__tests__/helpers/factories.ts`

### Creating Test Users

```typescript
import { createTestUser, createTestArtist, createTestAdmin } from '../helpers/factories';

// Create regular user with $1000 balance
const user = await createTestUser();

// Create user with custom data
const customUser = await createTestUser({
  email: 'specific@v2k.test',
  balance: 5000,
});

// Create artist
const artist = await createTestArtist({ verified: true });

// Create admin
const admin = await createTestAdmin();
```

### Creating Test Tracks

```typescript
import { createTestTrack } from '../helpers/factories';

const track = await createTestTrack(artist.id, {
  title: 'My Test Track',
  genre: 'TRAP',
  price: 15,
});
```

## 🎭 Test Mocks

Located in `__tests__/helpers/mocks.ts`

### Mock Files

```typescript
import { createMockMP3File, createFakeMP3File } from '../helpers/mocks';

const validMP3 = createMockMP3File(500); // 500KB with MP3 magic bytes
const fakeMP3 = createFakeMP3File(); // Text renamed as .mp3
```

## 🗄️ Database Testing

### Setup & Cleanup

```typescript
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/test-db';

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await cleanupTestDatabase(); // Deletes ONLY @v2k.test data
});
```

## ✅ Writing Tests

### API Route Test

```typescript
it('should return list of tracks', async () => {
  const artist = await createTestArtist();
  const track = await createTestTrack(artist.id);

  const res = await fetch('http://localhost:5000/api/tracks');
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.tracks).toContainEqual(
    expect.objectContaining({ id: track.id })
  );
});
```

### Component Test

```typescript
import { render, screen } from '@testing-library/react';

it('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 🔒 Security Testing

### CSRF Protection

```typescript
it('should reject request without Origin header', async () => {
  const res = await fetch('http://localhost:5000/api/investments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.status).toBe(403);
});
```

### Rate Limiting

```typescript
it('should rate limit after 5 requests', async () => {
  for (let i = 0; i < 6; i++) {
    const res = await fetch('http://localhost:5000/api/investments/create', {
      method: 'POST',
    });
    if (i < 5) expect(res.status).not.toBe(429);
    else expect(res.status).toBe(429);
  }
});
```

## 📊 Coverage Goals

- **Unit Tests:** 80%+ coverage
- **API Integration:** 100% critical endpoints
- **Security:** 100% security features
- **E2E:** 100% critical flows

## 🐛 Debugging

```bash
# Verbose logging
DEBUG_TESTS=true npm test

# Playwright inspector
npm run test:e2e:ui
```

## ⚠️ Common Pitfalls

1. **Not cleaning up**: Always use `cleanupTestDatabase()` in `afterEach`
2. **E2E with Jest**: Ensure `e2e/` excluded in `jest.config.ts`
3. **Test pollution**: Use `@v2k.test` namespace for isolation

## 📚 References

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
