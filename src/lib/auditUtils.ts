export interface TripAuditResult {
  tripId: string
  driverId: string
  anomalies: Anomaly[]
  overallStatus: 'clean' | 'warning' | 'critical'
  needsReview: boolean
}

export interface Anomaly {
  type: AnomalyType
  severity: 'low' | 'medium' | 'high'
  description: string
  value?: number
  threshold?: number
  recommendation?: string
}

export type AnomalyType = 
  | 'high_fuel_usage'
  | 'distance_anomaly'
  | 'missing_photo'
  | 'platform_mismatch'
  | 'repeated_image'
  | 'missing_attendance'
  | 'unusual_earnings'
  | 'time_anomaly'
  | 'fuel_efficiency_anomaly'

export interface AuditConfig {
  maxFuelPerTrip: number // in rupees
  minDistance: number // in km
  maxDistance: number // in km
  maxEarningsPerTrip: number // in rupees
  minFuelEfficiency: number // km per liter
  maxFuelEfficiency: number // km per liter
  requirePhotoForAmount: number // in rupees
  maxTripsPerDay: number
  maxTripsPerDriver: number
}

export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  maxFuelPerTrip: 2500, // ₹2500
  minDistance: 3, // 3 km
  maxDistance: 300, // 300 km
  maxEarningsPerTrip: 5000, // ₹5000
  minFuelEfficiency: 8, // 8 km/l
  maxFuelEfficiency: 25, // 25 km/l
  requirePhotoForAmount: 1000, // ₹1000
  maxTripsPerDay: 10,
  maxTripsPerDriver: 5
}

export function detectTripAnomalies(trip: any) {
  const anomalies: string[] = []

  if (trip.distance_km < 5) anomalies.push('Very low KM')
  if (trip.distance_km > 300) anomalies.push('Unusually high KM')
  if (trip.fuel_cost > 2500) anomalies.push('High fuel usage')
  if (!trip.photo_url) anomalies.push('Missing dashboard photo')
  if (trip.start_km && trip.end_km && trip.end_km - trip.start_km !== trip.distance_km)
    anomalies.push('KM mismatch')

  return anomalies
}

export function auditDriverTrips(trips: any[], driverId: string, config: AuditConfig = DEFAULT_AUDIT_CONFIG): TripAuditResult[] {
  return trips.map(trip => auditTrip(trip, config))
}

export function detectRepeatedImages(trips: any[]): Anomaly[] {
  const imageHashes = new Map<string, string[]>() // hash -> tripIds
  const anomalies: Anomaly[] = []

  trips.forEach(trip => {
    if (trip.photo_url) {
      // Simple hash based on URL (in production, use actual image hash)
      const hash = trip.photo_url.split('/').pop() || ''
      
      if (!imageHashes.has(hash)) {
        imageHashes.set(hash, [])
      }
      
      const tripIds = imageHashes.get(hash)!
      tripIds.push(trip.id)
      
      if (tripIds.length > 1) {
        anomalies.push({
          type: 'repeated_image',
          severity: 'high',
          description: `Same dashboard image used for ${tripIds.length} different trips`,
          value: tripIds.length,
          threshold: 1,
          recommendation: 'Investigate repeated image usage and ensure unique photos per trip.'
        })
      }
    }
  })

  return anomalies
}

export function checkPlatformMismatch(trip: any, driverAssignments: any[]): Anomaly[] {
  const anomalies: Anomaly[] = []
  
  // Check if driver is assigned to this platform
  const driverAssignment = driverAssignments.find(da => 
    da.driver_id === trip.driver_id && da.platform === trip.platform
  )
  
  if (!driverAssignment) {
    anomalies.push({
      type: 'platform_mismatch',
      severity: 'medium',
      description: `Driver not assigned to ${trip.platform} platform`,
      recommendation: 'Verify driver platform assignments and update if necessary.'
    })
  }
  
  return anomalies
}

export function checkMissingAttendance(trip: any, attendanceRecords: any[]): Anomaly[] {
  const anomalies: Anomaly[] = []
  
  // Check if there's attendance record for the trip date
  const attendance = attendanceRecords.find(a => 
    a.driver_id === trip.driver_id && a.date === trip.date
  )
  
  if (!attendance) {
    anomalies.push({
      type: 'missing_attendance',
      severity: 'medium',
      description: `No attendance record found for trip date ${trip.date}`,
      recommendation: 'Ensure attendance is marked for all working days.'
    })
  }
  
  return anomalies
}

export function getAnomalySummary(auditResults: TripAuditResult[]): {
  totalTrips: number
  tripsWithAnomalies: number
  criticalAnomalies: number
  warningAnomalies: number
  anomalyTypes: Record<AnomalyType, number>
} {
  const summary = {
    totalTrips: auditResults.length,
    tripsWithAnomalies: 0,
    criticalAnomalies: 0,
    warningAnomalies: 0,
    anomalyTypes: {} as Record<AnomalyType, number>
  }

  auditResults.forEach(result => {
    if (result.anomalies.length > 0) {
      summary.tripsWithAnomalies++
    }

    result.anomalies.forEach(anomaly => {
      if (anomaly.severity === 'high') {
        summary.criticalAnomalies++
      } else if (anomaly.severity === 'medium') {
        summary.warningAnomalies++
      }

      summary.anomalyTypes[anomaly.type] = (summary.anomalyTypes[anomaly.type] || 0) + 1
    })
  })

  return summary
}

export function generateAuditReport(auditResults: TripAuditResult[]): string {
  const summary = getAnomalySummary(auditResults)
  
  let report = `# Trip Audit Report\n\n`
  report += `## Summary\n`
  report += `- Total Trips: ${summary.totalTrips}\n`
  report += `- Trips with Anomalies: ${summary.tripsWithAnomalies}\n`
  report += `- Critical Anomalies: ${summary.criticalAnomalies}\n`
  report += `- Warning Anomalies: ${summary.warningAnomalies}\n\n`
  
  report += `## Anomaly Breakdown\n`
  Object.entries(summary.anomalyTypes).forEach(([type, count]) => {
    report += `- ${type}: ${count}\n`
  })
  
  report += `\n## Recommendations\n`
  if (summary.criticalAnomalies > 0) {
    report += `- Immediate review required for ${summary.criticalAnomalies} critical anomalies\n`
  }
  if (summary.warningAnomalies > 0) {
    report += `- Review ${summary.warningAnomalies} warning anomalies\n`
  }
  if (summary.tripsWithAnomalies === 0) {
    report += `- All trips appear to be within normal parameters\n`
  }
  
  return report
} 