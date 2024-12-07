/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["storage.googleapis.com"],
  },
  basePath: "",
  trailingSlash: false,
  experimental: {
    appDir: true, // Pastikan App Router aktif
  },
};

export default nextConfig;
