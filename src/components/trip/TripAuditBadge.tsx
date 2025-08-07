"use client"

import { useState } from "react"
import { 
  CheckCircle, AlertTriangle, XCircle, Eye, 
  Shield, AlertCircle, Info, Clock 
} from 'lucide-react'

interface TripAuditResult {
  tripId: string
  overallStatus: 'clean' | 'warning' | 'critical' | 'pending'
  needsReview: boolean
  anomalies: Array<{
    type: string
    description: string
    severity: 'low' | 'medium' | 'high'
    recommendation?: string
  }>
}

interface Anomaly {
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
  recommendation?: string
}

interface TripAuditBadgeProps {
  auditResult: TripAuditResult
  onReview?: (tripId: string) => void
  onVerify?: (tripId: string) => void
  showDetails?: boolean
}

export function TripAuditBadge({ anomalies }: { anomalies: string[] }) {
  if (!anomalies.length) {
    return <span className="text-green-600 font-medium">✅ Verified</span>
  }
  return (
    <span className="text-red-600 font-medium">
      ⚠️ {anomalies.length} issue(s)
    </span>
  )
}

export default function TripAuditBadgeFull({ 
  auditResult, 
  onReview, 
  onVerify, 
  showDetails = false 
}: TripAuditBadgeProps) {
  const [showAnomalyDetails, setShowAnomalyDetails] = useState(false)

  const getStatusConfig = (status: TripAuditResult['overallStatus']) => {
    switch (status) {
      case 'clean':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Verified'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Needs Review'
        }
      case 'critical':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Critical Issues'
        }
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Pending'
        }
    }
  }

  const getSeverityConfig = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        }
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertTriangle
        }
      case 'low':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Info
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Info
        }
    }
  }

  const statusConfig = getStatusConfig(auditResult.overallStatus)
  const Icon = statusConfig.icon

  if (!auditResult.needsReview) {
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}>
          <Icon className="h-3 w-3" />
          {statusConfig.text}
        </span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => setShowAnomalyDetails(!showAnomalyDetails)}>
          <Icon className="h-3 w-3" />
          {statusConfig.text}
        </span>
        
        {auditResult.anomalies.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-red-500 text-white rounded-full">
            {auditResult.anomalies.length}
          </span>
        )}

        <div className="flex items-center gap-1">
          {onReview && (
            <button
              onClick={() => onReview(auditResult.tripId)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Review anomalies"
            >
              <Eye className="h-3 w-3" />
            </button>
          )}
          
          {onVerify && auditResult.overallStatus !== 'critical' && (
            <button
              onClick={() => onVerify(auditResult.tripId)}
              className="p-1 text-gray-500 hover:text-green-600 transition-colors"
              title="Mark as verified"
            >
              <Shield className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Anomaly Details Popup */}
      {showAnomalyDetails && showDetails && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Anomaly Details</h4>
              <button
                onClick={() => setShowAnomalyDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {auditResult.anomalies.map((anomaly, index) => {
                const severityConfig = getSeverityConfig(anomaly.severity)
                const SeverityIcon = severityConfig.icon
                
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <SeverityIcon className={`h-4 w-4 mt-0.5 ${severityConfig.color.replace('bg-', 'text-').replace(' text-', '')}`} />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                          {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          {anomaly.description}
                        </p>
                        {anomaly.recommendation && (
                          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {anomaly.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {auditResult.anomalies.length} anomaly{auditResult.anomalies.length !== 1 ? 'ies' : ''} detected
                </span>
                <div className="flex items-center gap-2">
                  {onReview && (
                    <button
                      onClick={() => {
                        onReview(auditResult.tripId)
                        setShowAnomalyDetails(false)
                      }}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Review
                    </button>
                  )}
                  {onVerify && auditResult.overallStatus !== 'critical' && (
                    <button
                      onClick={() => {
                        onVerify(auditResult.tripId)
                        setShowAnomalyDetails(false)
                      }}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for tables
export function TripAuditBadgeCompact({ auditResult }: { auditResult: TripAuditResult }) {
  const statusConfig = getStatusConfig(auditResult.overallStatus)
  const Icon = statusConfig.icon

  return (
    <div className="flex items-center gap-1">
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
        <Icon className="h-3 w-3" />
        {auditResult.anomalies.length > 0 ? auditResult.anomalies.length : statusConfig.text}
      </span>
    </div>
  )
}

function getStatusConfig(status: TripAuditResult['overallStatus']) {
  switch (status) {
    case 'clean':
      return {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
        text: '✓'
      }
    case 'warning':
      return {
        icon: AlertTriangle,
        color: 'bg-yellow-100 text-yellow-800',
        text: '⚠'
      }
    case 'critical':
      return {
        icon: XCircle,
        color: 'bg-red-100 text-red-800',
        text: '✗'
      }
    default:
      return {
        icon: Clock,
        color: 'bg-gray-100 text-gray-800',
        text: '?'
      }
  }
} 