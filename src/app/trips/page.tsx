"use client"

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/layout/Layout'
import TripTable from "@/components/trip/TripTable"
import TripForm from "@/components/forms/TripForm"

export default function TripsPage() {
  const { user, loading } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <Layout>
      <div className="space-y-6">
        {showAddForm ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Add New Trip</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <TripForm
                onSuccess={() => {
                  setShowAddForm(false)
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">🚗 Trip Management</h1>
                <p className="text-gray-600 text-sm lg:text-base">Manage and monitor all trips with audit functionality</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Trip
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <TripTable />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 