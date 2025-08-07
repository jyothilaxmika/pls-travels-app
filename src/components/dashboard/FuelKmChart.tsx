import { TrendingUp, Fuel, MapPin } from 'lucide-react'

interface ChartDataPoint {
  date: string
  total_km: number
  total_fuel: number
  trip_count: number
}

interface FuelKmChartProps {
  data: ChartDataPoint[]
}

export default function FuelKmChart({ data }: FuelKmChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fuel & KM Trends</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p>No chart data available</p>
        </div>
      </div>
    )
  }

  // Calculate max values for scaling
  const maxKm = Math.max(...data.map(d => d.total_km))
  const maxFuel = Math.max(...data.map(d => d.total_fuel))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Fuel & KM Trends</h3>
      </div>
      
      <div className="space-y-4">
        {/* Chart Bars */}
        <div className="space-y-3">
          {data.slice(-7).map((point, index) => (
            <div key={point.date} className="flex items-center gap-4">
              <div className="w-20 text-xs text-gray-500">
                {new Date(point.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              
              {/* KM Bar */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-gray-600">{point.total_km} km</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(point.total_km / maxKm) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Fuel Bar */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Fuel className="h-3 w-3 text-orange-600" />
                  <span className="text-xs text-gray-600">{point.total_fuel}L</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(point.total_fuel / maxFuel) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="w-12 text-xs text-gray-500 text-center">
                {point.trip_count} trips
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-xs text-gray-600">Distance (KM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded"></div>
            <span className="text-xs text-gray-600">Fuel (L)</span>
          </div>
        </div>
      </div>
    </div>
  )
} 