/** @type {import('next').NextConfig} */
const nextConfig = {
  // typescript: {
  //   // !! WARN !!
  //   // Dangerously allow production builds to successfully complete even if
  //   // your project has TypeScript errors.
  //   ignoreBuildErrors: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  allowedDevOrigins: ['app.bluefire.love'],
  experimental: {
    serverActions: {
      allowedOrigins: ['app.bluefire.love', '161.35.225.243', '161.35.225.243:80', '161.35.225.243:3001']
    }
  }
};

export default nextConfig;