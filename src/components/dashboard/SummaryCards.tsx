'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SummaryCards() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalKM: 0,
    totalFuel: 0,
    totalEarnings: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('trips')
        .select('distance_km,fuel_cost,amount', { count: 'exact' })

      if (!data) return

      const totalKM = data.reduce((sum, t) => sum + (t.distance_km ?? 0), 0)
      const totalFuel = data.reduce((sum, t) => sum + (t.fuel_cost ?? 0), 0)
      const totalEarnings = data.reduce((sum, t) => sum + (t.amount ?? 0), 0)

      setStats({
        totalTrips: data.length,
        totalKM,
        totalFuel,
        totalEarnings,
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card title="Total Trips" value={stats.totalTrips} />
      <Card title="Total KM" value={stats.totalKM + ' km'} />
      <Card title="Total Fuel" value={'₹' + stats.totalFuel} />
      <Card title="Earnings" value={'₹' + stats.totalEarnings} />
    </div>
  )
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white shadow p-4 rounded border text-center">
      <h4 className="text-gray-500 text-sm">{title}</h4>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
} 