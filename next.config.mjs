/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ttn.technostupid.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'admin.thetextilenetwork.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'admin.thetextilenetwork.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
