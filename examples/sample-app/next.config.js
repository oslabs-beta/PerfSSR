/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    //to get telemetry data, need to set instrumentationHook to true
    instrumentationHook: true,
  },
  distDir: "build",
};

module.exports = nextConfig;
