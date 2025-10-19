/** @type {import('next').NextConfig} */
const nextConfig = {
  // images: {
  //   domains: ["storage.googleapis.com"],
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: false,

};

export default nextConfig;
