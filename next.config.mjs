/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next', // Directory where the compiled app is stored
  reactStrictMode: true, // Enable React strict mode
  swcMinify: true, // Use SWC for minification for performance
  images: {
    unoptimized: true, // If using Next.js' image optimization, adjust as needed for Netlify
  },
};

export default nextConfig;
