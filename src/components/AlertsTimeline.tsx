'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface AlertsTimelineProps {
  alerts: Array<{
    id: string
    timestamp: Date
    severity: string
    sensor_id: string
    description: string
    resolved?: boolean
  }>
  theme?: any
}

export default function AlertsTimeline({ alerts, theme }: AlertsTimelineProps) {
  const getSeverityColor = (severity: string) => {
    const severityMap = {
      low: theme?.status?.good?.bg || '#3B82F6',
      medium: theme?.status?.warning?.bg || '#F59E0B',
      high: theme?.status?.critical?.bg || '#EF4444',
      critical: '#DC2626'
    }
    return severityMap[severity as keyof typeof severityMap] || theme?.status?.good?.bg || '#3B82F6'
  }

  const getSeverityIcon = (severity: string) => {
    const iconMap = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🔥'
    }
    return iconMap[severity as keyof typeof iconMap] || 'ℹ️'
  }

  const getSensorName = (sensorId: string) => {
    if (theme?.sensors?.[sensorId]) {
      return `${theme.sensors[sensorId].icon} ${theme.sensors[sensorId].name}`
    }
    return (sensorId || 'unknown').replace('sensor_', 'Sensor ')
  }

  const recentAlerts = alerts.slice(0, 12) // Show last 12 alerts

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(51, 65, 85, 0.6)' }}
      className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:border-slate-600/70 hover:shadow-2xl group"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🚨 Recent Alerts
        </h3>
        <div className="text-sm text-slate-400 bg-slate-700/30 px-3 py-1 rounded-full">
          {alerts.length} total alerts
        </div>
      </div>

      {recentAlerts.length === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-slate-400 text-lg">No recent alerts</p>
            <p className="text-slate-500 text-sm mt-2">System running smoothly</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {recentAlerts.map((alert, index) => {
            const severityColor = getSeverityColor(alert.severity)
            const severityIcon = getSeverityIcon(alert.severity)
            const sensorName = getSensorName(alert.sensor_id || 'unknown')
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.02, 
                  x: 4,
                  backgroundColor: alert.resolved ? 'rgba(51, 65, 85, 0.3)' : 'rgba(51, 65, 85, 0.6)',
                  boxShadow: `0 4px 20px -2px ${severityColor}30`
                }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-lg border border-slate-600/50 cursor-pointer transition-all duration-300 ${
                  alert.resolved 
                    ? 'bg-slate-700/20 opacity-60 hover:opacity-80' 
                    : 'bg-slate-700/40'
                }`}
                style={{ borderLeftColor: severityColor, borderLeftWidth: '4px' }}
              >
                {/* Alert Status Badge */}
                <div className="absolute top-2 right-2">
                  {alert.resolved ? (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                      Resolved
                    </span>
                  ) : (
                                         <motion.span
                       animate={{ scale: [1, 1.1, 1] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="text-xs px-2 py-1 rounded-full font-medium"
                       style={{ 
                         backgroundColor: `${severityColor}20`, 
                         color: severityColor,
                         border: `1px solid ${severityColor}40`
                       }}
                     >
                       Active
                     </motion.span>
                  )}
                </div>

                {/* Alert Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ 
                      backgroundColor: `${severityColor}20`, 
                      border: `1px solid ${severityColor}40`
                    }}
                  >
                    {severityIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: severityColor }}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">
                        {format(alert.timestamp, 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>

                {/* Alert Details */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-600/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Sensor:</span>
                    <span className="text-xs text-slate-300 font-medium bg-slate-600/30 px-2 py-1 rounded">
                      {sensorName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {Math.floor((new Date().getTime() - alert.timestamp.getTime()) / 60000)}m ago
                  </div>
                </div>

                {/* Pulse animation for active alerts */}
                {!alert.resolved && alert.severity === 'critical' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 pointer-events-none"
                    style={{ borderColor: severityColor }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Alert Summary */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 pt-4 border-t border-slate-700/50"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-lg font-bold text-white">
                {alerts.filter(a => !a.resolved).length}
              </div>
              <div className="text-xs text-slate-400">Active Alerts</div>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-lg font-bold text-green-400">
                {alerts.filter(a => a.resolved).length}
              </div>
              <div className="text-xs text-slate-400">Resolved</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 