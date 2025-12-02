/**
 * Server-only authentication helpers
 * These functions can only be called from server-side code
 */
import 'server-only';
import { prisma } from '@/lib/db/prisma';
import { compare } from 'bcryptjs';

export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.hashedPassword) {
    return null;
  }

  const isPasswordValid = await compare(password, user.hashedPassword);

  if (!isPasswordValid) {
    return null;
  }

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
