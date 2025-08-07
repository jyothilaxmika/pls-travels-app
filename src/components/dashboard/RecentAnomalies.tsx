import { AlertTriangle, Clock, MapPin, Fuel, DollarSign, Eye, CheckCircle, XCircle } from 'lucide-react'

interface AnomalyTrip {
  id: string
  date: string
  distance_km: number
  fuel_cost: number
  amount: number
  notes: string
  anomaly_flag: boolean
  audit_status: string
  drivers: {
    name: string
    phone: string
  }
}

interface RecentAnomaliesProps {
  anomalies: AnomalyTrip[]
  onViewDetails?: (tripId: string) => void
  onMarkVerified?: (tripId: string) => void
  onMarkReview?: (tripId: string) => void
}

export default function RecentAnomalies({ 
  anomalies, 
  onViewDetails, 
  onMarkVerified, 
  onMarkReview 
}: RecentAnomaliesProps) {
  const getAnomalyReasons = (trip: AnomalyTrip) => {
    const reasons = []
    if (trip.distance_km < 10) reasons.push('Very low KM')
    if (trip.distance_km > 300) reasons.push('Unusually high KM')
    if (trip.fuel_cost && trip.fuel_cost > 30) reasons.push('High fuel usage')
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Anomalies</h3>
        <span className="ml-auto text-sm text-gray-500">{anomalies.length} found</span>
      </div>
      
      {anomalies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto text-green-300 mb-4" />
          <p>No anomalies detected</p>
          <p className="text-sm">All trips are verified and anomaly-free!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((trip) => (
            <div key={trip.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {trip.drivers?.name || 'Unknown Driver'}
                    </span>
                    {getStatusBadge(trip.audit_status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(trip.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {trip.distance_km} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      {trip.fuel_cost || 0}L
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ₹{trip.amount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Anomaly Reasons */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(trip.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </button>
                )}
                {onMarkVerified && trip.audit_status !== 'verified' && (
                  <button
                    onClick={() => onMarkVerified(trip.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 border border-green-300 rounded hover:bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Mark Verified
                  </button>
                )}
                {onMarkReview && trip.audit_status !== 'needs_review' && (
                  <button
                    onClick={() => onMarkReview(trip.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-yellow-600 hover:text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-50"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Mark for Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 