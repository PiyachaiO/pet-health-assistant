/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to use standard Next.js build
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

export default nextConfig