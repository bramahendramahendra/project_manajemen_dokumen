/** @type {import('next').NextConfig} */
const nextConfig = {
  // images: {
  //   domains: ["storage.googleapis.com"],
  // },
  images: {
    // Tambahkan remotePatterns untuk Google Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
    ],
    // Legacy domains support (bisa dihapus jika pakai remotePatterns)
    domains: ["storage.googleapis.com"],
    // Disable optimization untuk development jika perlu
    // unoptimized: process.env.NODE_ENV === 'development',
  },
  basePath: "/testing",
  // assetPrefix: "/testing",
  trailingSlash: false,

};

export default nextConfig;
