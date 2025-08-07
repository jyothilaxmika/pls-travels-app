"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Filter, Download, Eye, Edit, Trash2, Calendar, MapPin, DollarSign, Fuel, User, Camera } from 'lucide-react'
import { TripAuditBadge } from '@/components/trip/TripAuditBadge'
import { detectTripAnomalies } from '@/lib/auditUtils'

interface Trip {
  id: string
  date: string
  driver_id: string
  platform: string
  destination: string
  departure_time: string
  return_time?: string
  amount: number
  distance_km: number
  fuel_cost?: number
  notes?: string
  status: string
  photo_url?: string
  anomaly_flag: boolean
  audit_status: string
  drivers: {
    name: string
    phone: string
  }
}

export default function TripTable() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [auditFilter, setAuditFilter] = useState('all')
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalKm: 0,
    totalEarnings: 0,
    totalFuel: 0,
  })

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          drivers (
            name,
            phone
          )
        `)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching trips:', error)
        return
      }

      setTrips(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tripData: Trip[]) => {
    const stats = tripData.reduce(
      (acc, trip) => ({
        totalTrips: acc.totalTrips + 1,
        totalKm: acc.totalKm + trip.distance_km,
        totalEarnings: acc.totalEarnings + trip.amount,
        totalFuel: acc.totalFuel + (trip.fuel_cost || 0),
      }),
      { totalTrips: 0, totalKm: 0, totalEarnings: 0, totalFuel: 0 }
    )
    setStats(stats)
  }

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = 
      trip.drivers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.platform?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlatform = platformFilter === 'all' || trip.platform === platformFilter
    const matchesDate = !dateFilter || trip.date === dateFilter
    const matchesAudit = auditFilter === 'all' || trip.audit_status === auditFilter

    return matchesSearch && matchesPlatform && matchesDate && matchesAudit
  })

  const exportToCSV = () => {
    const headers = ['Date', 'Driver', 'Platform', 'Destination', 'Amount', 'Distance', 'Fuel', 'Status', 'Audit Status']
    const csvData = filteredTrips.map(trip => [
      trip.date,
      trip.drivers?.name || 'Unknown',
      trip.platform,
      trip.destination,
      trip.amount,
      trip.distance_km,
      trip.fuel_cost || 0,
      trip.status,
      trip.audit_status
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trips-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-xs lg:text-sm text-blue-600">Total Trips</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-blue-900">{stats.totalTrips}</p>
        </div>
        
        <div className="bg-green-50 p-3 lg:p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-xs lg:text-sm text-green-600">Total KM</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-green-900">{stats.totalKm.toLocaleString()}</p>
        </div>
        
        <div className="bg-purple-50 p-3 lg:p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <span className="text-xs lg:text-sm text-purple-600">Earnings</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-purple-900">₹{stats.totalEarnings.toLocaleString()}</p>
        </div>
        
        <div className="bg-orange-50 p-3 lg:p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-orange-600" />
            <span className="text-xs lg:text-sm text-orange-600">Fuel Cost</span>
          </div>
          <p className="text-lg lg:text-xl font-bold text-orange-900">₹{stats.totalFuel.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-3 lg:p-4 rounded-lg space-y-3 lg:space-y-0 lg:space-x-4 lg:flex lg:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Platforms</option>
            <option value="uber">Uber</option>
            <option value="ola">Ola</option>
            <option value="rapido">Rapido</option>
            <option value="other">Other</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          
          <select
            value={auditFilter}
            onChange={(e) => setAuditFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="needs_review">Needs Review</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Trips List */}
      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No trips found matching your criteria.</p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const anomalies = detectTripAnomalies(trip)
            
            return (
              <div key={trip.id} className="bg-white rounded-lg shadow p-4 lg:p-6 border border-gray-200">
                {/* Mobile Layout */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{trip.drivers?.name || 'Unknown Driver'}</h3>
                      <p className="text-sm text-gray-600">{new Date(trip.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                        trip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status}
                      </span>
                      <TripAuditBadge anomalies={anomalies} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{trip.distance_km} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{trip.amount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-orange-600" />
                      <span className="text-gray-600">Fuel:</span>
                      <span className="font-medium">₹{trip.fuel_cost || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-purple-600" />
                      <span className="text-gray-600">Platform:</span>
                      <span className="font-medium capitalize">{trip.platform}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600">Destination: <span className="font-medium">{trip.destination}</span></p>
                    <p className="text-gray-600">Time: <span className="font-medium">{trip.departure_time}</span></p>
                  </div>
                  
                  {trip.photo_url && (
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      <button
                        onClick={() => window.open(`https://xolfpyfftgalzvhpiffh.supabase.co/storage/v1/object/public/trip-photos/${trip.photo_url}`, '_blank')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Photo
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50">
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 border border-green-300 rounded hover:bg-green-50">
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{trip.drivers?.name || 'Unknown Driver'}</p>
                        <p className="text-sm text-gray-500">{trip.drivers?.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <p className="text-sm text-gray-900">{new Date(trip.date).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {trip.platform}
                    </span>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <p className="text-sm text-gray-900 truncate">{trip.destination}</p>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <p className="text-sm font-medium text-gray-900">₹{trip.amount}</p>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <p className="text-sm text-gray-900">{trip.distance_km} km</p>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                      trip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <TripAuditBadge anomalies={anomalies} />
                  </div>
                  
                  <div className="lg:col-span-1">
                    {trip.photo_url ? (
                      <button
                        onClick={() => window.open(`https://xolfpyfftgalzvhpiffh.supabase.co/storage/v1/object/public/trip-photos/${trip.photo_url}`, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-gray-400">
                        <Camera className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 