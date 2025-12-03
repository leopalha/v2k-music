/**
 * Server-only authentication helpers
 * These functions can only be called from server-side code
 */
// import 'server-only'; // Temporarily commented for debugging
import { prisma } from '@/lib/db/prisma';
import { compare } from 'bcryptjs';

export async function validateCredentials(email: string, password: string) {
  console.log('[AUTH] Validating credentials for:', email);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  console.log('[AUTH] User found:', !!user, user ? `ID: ${user.id}` : 'null');

  if (!user || !user.hashedPassword) {
    console.log('[AUTH] No user or no hashed password');
    return null;
  }

  const isPasswordValid = await compare(password, user.hashedPassword);
  console.log('[AUTH] Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    console.log('[AUTH] Invalid password');
    return null;
  }

  console.log('[AUTH] Success! Returning user:', user.id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.profileImageUrl,
  };
}

export async function findOrCreateGoogleUser(email: string, name: string | null, image: string | null) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return existingUser;
  }

  return await prisma.user.create({
    data: {
      email,
      name: name || '',
      profileImageUrl: image,
      hashedPassword: null,
      onboardingCompleted: false,
    },
  });
}
