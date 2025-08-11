"use client"

import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/layout/Layout'
import InteractiveDashboard from '@/components/dashboard/InteractiveDashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login via middleware
  }

  return (
    <Layout>
      <InteractiveDashboard />
    </Layout>
  )
}

 