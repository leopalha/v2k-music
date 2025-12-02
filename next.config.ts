import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Prisma Client on the client side
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
        '.prisma/client': false,
      };
    }
    return config;
  },
};

export default nextConfig;
