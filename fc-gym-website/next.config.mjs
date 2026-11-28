/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  devIndicators: false,
  reactStrictMode: true,
};
export default nextConfig;
