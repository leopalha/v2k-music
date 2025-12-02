import 'server-only';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';

let handler: ReturnType<typeof startServerAndCreateNextHandler<NextRequest>> | null = null;

function getHandler() {
  if (!handler) {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      formatError: (formattedError) => {
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

    handler = startServerAndCreateNextHandler<NextRequest>(server, {
      context: async (req) => {
        const session = await getServerSession(authOptions);
        return {
          userId: session?.user?.id,
          user: session?.user,
        };
      },
    });
  }
  return handler;
}

export async function GET(request: NextRequest) {
  return getHandler()(request);
}

export async function POST(request: NextRequest) {
  return getHandler()(request);
}
