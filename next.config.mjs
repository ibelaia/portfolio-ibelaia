/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/__clerk/:path*',
        destination: 'https://api.clerk.com/v1/:path*',
      },
    ];
  },
};

export default nextConfig;