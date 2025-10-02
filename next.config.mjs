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
  basePath: "/testing",
  trailingSlash: false,

};

export default nextConfig;
