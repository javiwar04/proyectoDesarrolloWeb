/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    const dest = base.replace(/\/$/, '');
    return [
      {
        source: '/backend/:path*',
        destination: `${dest}/:path*`,
      },
    ];
  },
}

export default nextConfig
