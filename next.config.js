/** @type {import('next').NextConfig} */
const nextConfig = {
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
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  output: 'standalone',
}

module.exports = nextConfig
