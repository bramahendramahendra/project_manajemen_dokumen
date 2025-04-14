/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["storage.googleapis.com"],
  },
  basePath: "",
  trailingSlash: false,

  // // Menambahkan rewrites untuk proxy API
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',  // Semua permintaan ke /api/... akan diproksikan
  //       destination: 'http://localhost:8080/api/:path*', // Arahkan ke backend Anda di localhost
  //     },
  //   ];
  // },

};

export default nextConfig;
