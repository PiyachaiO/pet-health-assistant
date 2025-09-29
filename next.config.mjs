/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side rendering for the entire app
  experimental: {
    esmExternals: false
  }
}

export default nextConfig