/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:true
};

module.exports = async phase => {
    console.log('Starting phase ', phase);
    return nextConfig;
};
