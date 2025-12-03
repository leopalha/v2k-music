import { Session } from 'next-auth';
import { User } from '@prisma/client';

/**
 * Creates a mock NextAuth session
 */
export function createMockSession(user: User): Session {
  return {
    user: {
      id: user.id,
      email: user.email!,
      name: user.name!,
      role: user.role,
      image: user.avatar || null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
  };
}

/**
 * Mock Stripe SDK for testing
 */
export const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123456789',
        url: 'https://checkout.stripe.com/test/123',
        payment_status: 'unpaid',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cs_test_123456789',
        payment_status: 'paid',
        metadata: {
          userId: 'test-user-id',
          trackId: 'test-track-id',
          amount: '100',
        },
      }),
    },
  },
  webhooks: {
    constructEvent: jest.fn().mockImplementation((payload, sig, secret) => {
      return {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123456789',
            payment_status: 'paid',
            metadata: {
              userId: 'test-user-id',
              trackId: 'test-track-id',
              amount: '100',
            },
          },
        },
      };
    }),
  },
};

/**
 * Mock Next.js Request with headers
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    session?: Session | null;
  }
): Request {
  const headers = new Headers(options?.headers || {});
  
  // Add default headers
  if (!headers.has('origin')) {
    headers.set('origin', 'http://localhost:5000');
  }
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return new Request(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
}

/**
 * Mock FormData for file uploads
 */
export function createMockFormData(fields: Record<string, string | File>): FormData {
  const formData = new FormData();
  
  for (const [key, value] of Object.entries(fields)) {
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value);
    }
  }
  
  return formData;
}

/**
 * Create mock MP3 file
 */
export function createMockMP3File(sizeKB = 100): File {
  // MP3 header signature: 0xFF 0xFB
  const header = new Uint8Array([0xFF, 0xFB]);
  const data = new Uint8Array(sizeKB * 1024);
  
  // Copy header to start of data
  data.set(header);
  
  return new File([data], 'test-audio.mp3', { type: 'audio/mpeg' });
}

/**
 * Create mock JPEG file
 */
export function createMockJPEGFile(sizeKB = 50): File {
  // JPEG header signature: 0xFF 0xD8 0xFF
  const header = new Uint8Array([0xFF, 0xD8, 0xFF]);
  const data = new Uint8Array(sizeKB * 1024);
  
  // Copy header to start of data
  data.set(header);
  
  return new File([data], 'test-cover.jpg', { type: 'image/jpeg' });
}

/**
 * Create fake file (renamed .exe or .txt as .mp3)
 */
export function createFakeMP3File(): File {
  // Plain text, no MP3 header
  const data = new TextEncoder().encode('This is not an MP3 file');
  return new File([data], 'fake-audio.mp3', { type: 'audio/mpeg' });
}

/**
 * Mock Prisma client for unit tests (when DB not available)
 */
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  track: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  portfolio: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
  },
};

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Flush all pending promises
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));
