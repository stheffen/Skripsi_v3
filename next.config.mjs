/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'zod', 'recharts'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
