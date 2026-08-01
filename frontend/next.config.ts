import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiTarget = process.env.NEXT_PUBLIC_API_URL || 'https://tms-back-end.vercel.app/api';
    const destination = apiTarget.endsWith('/') 
      ? `${apiTarget}:path*` 
      : `${apiTarget}/:path*`;

    return [
      {
        source: '/api/:path*',
        destination,
      },
    ];
  },
};

export default nextConfig;
