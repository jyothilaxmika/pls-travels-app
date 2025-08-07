"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Download,
  Save,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Navigation from '@/components/layout/Navigation'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      anomalies: true,
      reports: false
    },
    preferences: {
      theme: 'light',
      currency: 'INR'
    }
  })

  const saveSettings = async () => {
    setLoading(true)
    try {
      // Save settings logic here
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      if (trips) {
        const csvContent = [
          ['Date', 'Platform', 'Destination', 'Amount', 'Distance'],
          ...trips.map(trip => [
            new Date(trip.date).toLocaleDateString(),
            trip.platform,
            trip.destination,
            trip.amount,
            trip.distance_km
          ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `trips-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'data', name: 'Data & Export', icon: Database }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={user.email?.split('@')[0] || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-500">Receive {key} notifications</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [key]: !value
                          }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">App Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                      value={settings.preferences.theme}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          theme: e.target.value
                        }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.preferences.currency}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          currency: e.target.value
                        }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Data Export</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Export all your trip data as CSV
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Save your changes</p>
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
