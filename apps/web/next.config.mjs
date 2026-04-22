/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@plotto/ai', '@plotto/db', '@plotto/schema', '@plotto/ui-tokens'],
  typedRoutes: true,
};

export default nextConfig;
