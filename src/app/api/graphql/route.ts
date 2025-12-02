import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable GraphiQL in production
  formatError: (formattedError) => {
    // Hide internal errors in production
    if (process.env.NODE_ENV === 'production') {
      return {
        message: formattedError.message,
        extensions: {
          code: formattedError.extensions?.code,
        },
      };
    }
    return formattedError;
  },
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    // Get user session
    const session = await getServerSession(authOptions);
    
    return {
      userId: session?.user?.id,
      user: session?.user,
    };
  },
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
