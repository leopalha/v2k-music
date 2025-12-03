import { TestUser } from './auth';

/**
 * Test users with @v2k.e2e namespace for isolation
 */
export const TEST_USERS = {
  investor: {
    email: 'investor@v2k.e2e',
    password: 'Test123!@#',
    name: 'Test Investor',
    role: 'USER' as const,
  },
  artist: {
    email: 'artist@v2k.e2e',
    password: 'Test123!@#',
    name: 'Test Artist',
    role: 'USER' as const,
  },
  admin: {
    email: 'admin@v2k.e2e',
    password: 'Test123!@#',
    name: 'Test Admin',
    role: 'ADMIN' as const,
  },
  newUser: {
    email: `user-${Date.now()}@v2k.e2e`,
    password: 'Test123!@#',
    name: 'New Test User',
    role: 'USER' as const,
  },
} satisfies Record<string, TestUser>;

/**
 * Test track metadata
 */
export const TEST_TRACK = {
  title: 'Test Track E2E',
  artistName: 'Test Artist E2E',
  genre: 'ELETRONICA',
  currentPrice: 10.0,
  initialPrice: 10.0,
  totalTokens: 1000,
  availableTokens: 1000,
  description: 'This is a test track for E2E testing',
  duration: 180,
  releaseDate: new Date().toISOString(),
};

/**
 * Test investment data
 */
export const TEST_INVESTMENT = {
  amount: 100, // $100 investment
  tokens: 10, // 10 tokens at $10 each
};

/**
 * Test limit order data
 */
export const TEST_LIMIT_ORDER = {
  type: 'BUY' as const,
  price: 9.5,
  quantity: 5,
};

/**
 * Test GDPR export expected fields
 */
export const GDPR_EXPORT_FIELDS = [
  'profile',
  'transactions',
  'comments',
  'favorites',
  'portfolio',
  'notifications',
] as const;

/**
 * Mock MP3 file for upload testing
 */
export function createMockMP3File(): File {
  // Create a minimal valid MP3 file (ID3v2 header)
  const mp3Header = new Uint8Array([
    0x49, 0x44, 0x33, // "ID3"
    0x03, 0x00, // Version 2.3.0
    0x00, // Flags
    0x00, 0x00, 0x00, 0x00, // Size
  ]);
  
  const blob = new Blob([mp3Header], { type: 'audio/mpeg' });
  return new File([blob], 'test-track.mp3', { type: 'audio/mpeg' });
}

/**
 * Mock JPEG image for cover upload testing
 */
export function createMockJPEGFile(): File {
  // Create a minimal valid JPEG file
  const jpegHeader = new Uint8Array([
    0xff, 0xd8, // JPEG SOI marker
    0xff, 0xe0, // JFIF marker
    0x00, 0x10, // Length
    0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version 1.1
    0x00, // Density units
    0x00, 0x01, 0x00, 0x01, // X/Y density
    0x00, 0x00, // Thumbnail size
    0xff, 0xd9, // JPEG EOI marker
  ]);
  
  const blob = new Blob([jpegHeader], { type: 'image/jpeg' });
  return new File([blob], 'test-cover.jpg', { type: 'image/jpeg' });
}
