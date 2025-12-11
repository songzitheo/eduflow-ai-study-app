/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase limit to 10MB for PDF uploads
    },
  },
};

module.exports = nextConfig;
