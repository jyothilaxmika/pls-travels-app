/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['oiizdjzegvkqimbwjzax.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oiizdjzegvkqimbwjzax.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
