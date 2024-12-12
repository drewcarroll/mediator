/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['my-trusted-origin.com']
    }
  }
}

module.exports = nextConfig