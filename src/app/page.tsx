'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!isSupabaseConfigured) return
      if (user) router.push('/dashboard')
      else router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      <p data-testid="loading-message">Loading...</p>
    </div>
  )
}
