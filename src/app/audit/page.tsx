"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AlertTriangle, Calendar, MapPin, Fuel, DollarSign, Eye, User, Filter, Menu, X } from 'lucide-react'

interface AnomalyTrip {
  id: string
  date: string
  distance_km: number
  fuel_cost: number
  amount: number
  notes: string
  photo_url: string
  anomaly_flag: boolean
  audit_status: string
  driver_id: string
  drivers: {
    name: string
    phone: string
  } | null
}

export default function AuditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [anomalyTrips, setAnomalyTrips] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [filter, setFilter] = useState('all') // all, needs_review, verified
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user) {
      fetchAnomalyTrips()
    }
  }, [user, loading, router, filter])

  const fetchAnomalyTrips = async () => {
    try {
      setLoadingData(true)
      
      let query = supabase
        .from('trips')
        .select(`
          id,
          date,
          distance_km,
          fuel_cost,
          amount,
          notes,
          photo_url,
          anomaly_flag,
          audit_status,
          driver_id,
          drivers (
            name,
            phone
          )
        `)
        .eq('anomaly_flag', true)
        .order('date', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('audit_status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching anomaly trips:', error)
        return
      }

      setAnomalyTrips(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const getAnomalyReasons = (trip: AnomalyTrip) => {
    const reasons = []
    if (trip.distance_km < 10) reasons.push('Very low KM')
    if (trip.distance_km > 300) reasons.push('Unusually high KM')
    if (trip.fuel_cost && trip.fuel_cost > 30) reasons.push('High fuel usage')
    if (!trip.photo_url) reasons.push('Missing dashboard photo')
    return reasons
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      needs_review: 'bg-red-100 text-red-800',
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || loadingData) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b lg:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h1 className="ml-2 text-lg font-bold text-gray-900">
              PLS Travels
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/trips')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                View All Trips
              </button>
              <button
                onClick={() => router.push('/drivers')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Manage Drivers
              </button>
              <div className="border-t pt-2">
                <span className="block px-3 py-1 text-sm text-gray-500">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                PLS Travels DMS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">🚨 Anomaly Trips</h1>
                <p className="text-gray-600 text-sm lg:text-base">Review and manage trips with potential issues</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Anomalies</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="text-right">
                <p className="text-xl lg:text-2xl font-bold text-red-600">{anomalyTrips.length}</p>
                <p className="text-xs lg:text-sm text-gray-600">Anomaly Trips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Trips List */}
        {anomalyTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 lg:p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Anomaly Trips</h3>
            <p className="text-gray-500 text-sm lg:text-base">
              {filter === 'all' 
                ? 'All trips are verified and anomaly-free!' 
                : `No trips with status "${filter.replace('_', ' ')}"`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalyTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                        {trip.drivers?.name || 'Unknown Driver'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(trip.date).toLocaleDateString()} • {trip.drivers?.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(trip.audit_status)}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Distance:</span>
                    <span className="font-medium text-sm">{trip.distance_km} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Fuel:</span>
                    <span className="font-medium text-sm">{trip.fuel_cost || 0}L</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Earning:</span>
                    <span className="font-medium text-sm">₹{trip.amount || 0}</span>
                  </div>
                </div>

                {/* Anomaly Reasons */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Anomaly Reasons:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getAnomalyReasons(trip).map((reason, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {trip.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {trip.notes}
                    </p>
                  </div>
                )}

                {/* Photo */}
                {trip.photo_url && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Dashboard Photo:</h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <img
                        src={`https://oiizdjzegvkqimbwjzax.supabase.co/storage/v1/object/public/trip-photos/${trip.photo_url}`}
                        alt="Dashboard photo"
                        className="h-20 w-20 lg:h-24 lg:w-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() => window.open(`https://oiizdjzegvkqimbwjzax.supabase.co/storage/v1/object/public/trip-photos/${trip.photo_url}`, '_blank')}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Full Size
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // TODO: Implement mark as verified
                      console.log('Mark as verified:', trip.id)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded hover:bg-green-50"
                  >
                    ✓ Mark as Verified
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement mark for review
                      console.log('Mark for review:', trip.id)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-yellow-600 hover:text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-50"
                  >
                    ⚠ Mark for Review
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement edit trip
                      console.log('Edit trip:', trip.id)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    ✏ Edit Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
