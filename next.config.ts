import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        // This allows images from YOUR specific Supabase project
        hostname: 'racapgorxqriomacfdpz.supabase.co', 
      },
    ],
  },
};

export default nextConfig;