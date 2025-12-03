import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[NEXTAUTH] authorize() called');
        console.log('[NEXTAUTH] credentials:', credentials ? { email: credentials.email, hasPassword: !!credentials.password } : null);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[NEXTAUTH] Missing credentials');
          return null;
        }

        try {
          // Dynamic import to avoid bundling server-only code in client
          const { validateCredentials } = await import('@/lib/auth-helpers');
          const user = await validateCredentials(credentials.email, credentials.password);
          console.log('[NEXTAUTH] validateCredentials result:', user ? 'USER FOUND' : 'NULL');
          return user;
        } catch (error) {
          console.error('[NEXTAUTH] Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Dynamic import to avoid bundling server-only code in client
        const { findOrCreateGoogleUser } = await import('@/lib/auth-helpers');
        await findOrCreateGoogleUser(user.email!, user.name ?? null, user.image ?? null);
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
