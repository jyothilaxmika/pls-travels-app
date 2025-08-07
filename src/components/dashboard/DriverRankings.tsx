import { Trophy, TrendingUp, MapPin, DollarSign } from 'lucide-react'

interface DriverRanking {
  driver_id: string
  driver_name: string
  driver_phone: string
  total_trips: number
  total_km: number
  total_earning: number
}

interface DriverRankingsProps {
  rankings: DriverRanking[]
}

export default function DriverRankings({ rankings }: DriverRankingsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Driver Rankings</h3>
      </div>
      
      {rankings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p>No driver data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.slice(0, 5).map((driver, index) => (
            <div key={driver.driver_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{driver.driver_name}</p>
                  <p className="text-sm text-gray-500">{driver.driver_phone}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{driver.total_km} km</span>
                    </div>
                    <p className="text-xs text-gray-500">{driver.total_trips} trips</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <DollarSign className="h-3 w-3" />
                      <span>₹{driver.total_earning.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      ₹{driver.total_trips > 0 ? (driver.total_earning / driver.total_trips).toFixed(0) : 0}/trip
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 