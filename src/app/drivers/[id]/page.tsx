"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AddTripForm from '@/components/forms/AddTripForm'
import { User, MapPin, Phone, Calendar, DollarSign, TrendingUp, Fuel, AlertTriangle } from 'lucide-react'

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  status: string
  created_at: string
}

interface Trip {
  id: string
  date: string
  distance_km: number
  fuel_cost: number
  amount: number
  notes: string
  photo_url: string
  anomaly_flag: boolean
  audit_status: string
}

interface Payment {
  id: string
  amount: number
  date: string
  status: string
  notes: string
}

export default function DriverDetailPage() {
  const params = useParams()
  const driverId = params.id as string
  
  const [driver, setDriver] = useState<Driver | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDriverData()
  }, [driverId])

  const fetchDriverData = async () => {
    try {
      setLoading(true)
      
      // Fetch driver details
      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single()

      // Fetch trips
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', driverId)
        .order('date', { ascending: false })

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('driver_id', driverId)
        .order('date', { ascending: false })

      setDriver(driverData)
      setTrips(tripsData || [])
      setPayments(paymentsData || [])
    } catch (error) {
      console.error('Error fetching driver data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalKm = trips.reduce((sum, t) => sum + (t.distance_km || 0), 0)
  const totalEarning = trips.reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const anomalyTrips = trips.filter(t => t.anomaly_flag).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Driver Not Found</h1>
          <p className="text-gray-600">The driver you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Driver Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {driver.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(driver.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                driver.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {driver.status}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total KM</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalKm.toLocaleString()} km</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{totalEarning.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Anomaly Trips</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{anomalyTrips}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Trip Form */}
          <div>
            <AddTripForm driverId={driverId} />
          </div>

          {/* Recent Trips */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Trips</h2>
            {trips.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No trips recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {trips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(trip.date).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.anomaly_flag 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {trip.anomaly_flag ? 'Anomaly' : 'Verified'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">KM:</span>
                        <span className="ml-1 font-medium">{trip.distance_km}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fuel:</span>
                        <span className="ml-1 font-medium">{trip.fuel_cost || 0}L</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Earning:</span>
                        <span className="ml-1 font-medium">₹{trip.amount || 0}</span>
                      </div>
                    </div>
                    {trip.photo_url && (
                      <div className="mt-2">
                        <img 
                          src={`https://oiizdjzegvkqimbwjzax.supabase.co/storage/v1/object/public/trip-photos/${trip.photo_url}`}
                          alt="Dashboard photo"
                          className="h-16 w-16 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 