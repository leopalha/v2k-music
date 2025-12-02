import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      walletAddress?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    walletAddress?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    walletAddress?: string | null;
  }
}
