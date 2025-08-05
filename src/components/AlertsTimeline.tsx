'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Info, AlertCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

interface Alert {
  id: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
  sensor_id: string
  description: string
}

interface AlertsTimelineProps {
  alerts: Alert[]
}

export default function AlertsTimeline({ alerts }: AlertsTimelineProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          pulse: 'bg-red-500'
        }
      case 'medium':
        return {
          icon: AlertCircle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          pulse: 'bg-yellow-500'
        }
      case 'low':
      default:
        return {
          icon: Info,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          pulse: 'bg-blue-500'
        }
    }
  }

  const recentAlerts = alerts.slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🚨 Recent Alerts
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Last 24h</span>
        </div>
      </div>

      {recentAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
          >
            <AlertTriangle className="w-8 h-8 text-green-400" />
          </motion.div>
          <p className="text-slate-400 text-center">
            ✅ No Recent Alerts<br />
            <span className="text-sm text-slate-500">System Operating Normally</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {recentAlerts.map((alert, index) => {
            const config = getSeverityConfig(alert.severity)
            const Icon = config.icon
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} relative overflow-hidden`}
              >
                {/* Alert Content */}
                <div className="flex items-start gap-3">
                  {/* Severity Icon with Pulse */}
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 ${config.pulse} rounded-full opacity-20`}
                    />
                    <div className={`p-2 rounded-full ${config.bgColor} border ${config.borderColor} relative`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                  </div>

                  {/* Alert Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium uppercase ${config.color}`}>
                        {alert.severity} ALERT
                      </span>
                      <span className="text-xs text-slate-400">
                        {format(alert.timestamp, 'HH:mm:ss')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-white mb-2 leading-relaxed">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Sensor:</span>
                      <span className="text-xs font-mono bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                        {alert.sensor_id.replace('sensor_', 'S')}
                      </span>
                      <span className="text-xs text-slate-500">
                        • {format(alert.timestamp, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${config.pulse.replace('bg-', 'from-')} to-transparent opacity-5`} />
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-3 gap-4">
          {['high', 'medium', 'low'].map(severity => {
            const count = alerts.filter(a => a.severity === severity).length
            const config = getSeverityConfig(severity)
            
            return (
              <div key={severity} className="text-center">
                <motion.div
                  key={count}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`text-lg font-bold ${config.color}`}
                >
                  {count}
                </motion.div>
                <div className="text-xs text-slate-400 capitalize">{severity}</div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }
      `}</style>
    </motion.div>
  )
} 