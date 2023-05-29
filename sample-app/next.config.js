/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  distDir: "build",
};

module.exports = nextConfig;
