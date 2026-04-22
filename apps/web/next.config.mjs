/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@plotto/schema', '@plotto/ui-tokens'],
  typedRoutes: true,
};

export default nextConfig;
