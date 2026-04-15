/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    // ignore vecrcel typescript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
   
    ignoreDuringBuilds: true,
  },
  turbopack: {
    // ...
  },
}
 
export default nextConfig