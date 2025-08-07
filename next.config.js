/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: ['xolfpyfftgalzvhpiffh.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xolfpyfftgalzvhpiffh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
