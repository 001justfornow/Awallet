/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Don’t block production builds on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ (Optional) Don’t block builds on type errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;


export default nextConfig;
