'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface SensorHealthMatrixProps {
  data: Array<{
    timestamp: Date
    sensor_id: string
    value: number
    is_anomaly_detected: boolean
    sensor_type?: string
  }>
  theme?: any
}

export default function SensorHealthMatrix({ data, theme }: SensorHealthMatrixProps) {
  // Process sensor health data
  const healthMatrix = useMemo(() => {
    const sensorMetrics: Record<string, {
      activity: number
      anomalyRate: number
      signalQuality: number
      responseTime: number
      avgValue: number
      lastSeen: Date
      status: 'excellent' | 'good' | 'warning' | 'critical'
    }> = {}

    // Group data by sensor
    const sensorGroups: Record<string, typeof data> = {}
    data.forEach(point => {
      if (!sensorGroups[point.sensor_id]) {
        sensorGroups[point.sensor_id] = []
      }
      sensorGroups[point.sensor_id].push(point)
    })

    // Calculate metrics for each sensor
    Object.entries(sensorGroups).forEach(([sensorId, points]) => {
      const anomalies = points.filter(p => p.is_anomaly_detected)
      const anomalyRate = points.length > 0 ? anomalies.length / points.length : 0
      const avgValue = points.length > 0 ? points.reduce((sum, p) => sum + p.value, 0) / points.length : 0
      const activity = Math.min(points.length / 20, 1) * 100 // Convert to percentage
      const signalQuality = Math.max(70, 95 - (anomalyRate * 100)) // Signal quality inversely related to anomalies
      const responseTime = Math.max(70, 100 - (anomalyRate * 50)) // Response time affected by anomalies
      const lastSeen = points.length > 0 ? new Date(Math.max(...points.map(p => p.timestamp.getTime()))) : new Date()

      // Determine overall status based on multiple factors
      let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent'
      const avgMetric = (activity + signalQuality + responseTime) / 3
      
      if (avgMetric < 40 || anomalyRate > 0.2) status = 'critical'
      else if (avgMetric < 60 || anomalyRate > 0.1) status = 'warning'
      else if (avgMetric < 80 || anomalyRate > 0.05) status = 'good'

      sensorMetrics[sensorId] = {
        activity,
        anomalyRate: anomalyRate * 100, // Convert to percentage
        signalQuality,
        responseTime,
        avgValue,
        lastSeen,
        status
      }
    })

    return sensorMetrics
  }, [data])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'good': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  const getMetricColor = (value: number, type: 'activity' | 'anomaly' | 'signal' | 'response') => {
    if (type === 'anomaly') {
      // Lower is better for anomaly rate
      if (value < 5) return 'text-green-400'
      if (value < 10) return 'text-blue-400'
      if (value < 15) return 'text-yellow-400'
      return 'text-red-400'
    } else {
      // Higher is better for others
      if (value >= 90) return 'text-green-400'
      if (value >= 80) return 'text-blue-400'
      if (value >= 70) return 'text-yellow-400'
      return 'text-red-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🟢'
      case 'good': return '🔵'
      case 'warning': return '🟡'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📊 Real-time Health Metrics Dashboard
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Metrics Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-300 font-medium min-w-[120px]">Sensor</th>
              <th className="text-center py-3 px-4 text-slate-300 font-medium min-w-[100px]">📊 Activity</th>
              <th className="text-center py-3 px-4 text-slate-300 font-medium min-w-[120px]">⚠️ Anomaly Rate</th>
              <th className="text-center py-3 px-4 text-slate-300 font-medium min-w-[120px]">📡 Signal Quality</th>
              <th className="text-center py-3 px-4 text-slate-300 font-medium min-w-[130px]">⏱️ Response Time</th>
              <th className="text-center py-3 px-4 text-slate-300 font-medium min-w-[100px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(healthMatrix).map(([sensorId, metrics]) => (
              <motion.tr
                key={sensorId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-mono font-medium">{sensorId}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-bold text-lg ${getMetricColor(metrics.activity, 'activity')}`}>
                    {metrics.activity.toFixed(0)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-bold text-lg ${getMetricColor(metrics.anomalyRate, 'anomaly')}`}>
                    {metrics.anomalyRate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-bold text-lg ${getMetricColor(metrics.signalQuality, 'signal')}`}>
                    {metrics.signalQuality.toFixed(0)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-bold text-lg ${getMetricColor(metrics.responseTime, 'response')}`}>
                    {metrics.responseTime.toFixed(0)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(metrics.status)}`}>
                    <span>{getStatusIcon(metrics.status)}</span>
                    <span className="capitalize">{metrics.status}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Metrics Definitions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-slate-300 flex items-center gap-2">
            📋 Metric Definitions & Critical Thresholds
          </h4>
          
          <div className="space-y-3">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 font-medium">📊 Activity</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">Measures sensor data frequency and responsiveness.</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2"><span className="text-green-400">🟢 &gt;80%:</span> <span className="text-slate-300">Excellent</span></div>
                <div className="flex items-center gap-2"><span className="text-blue-400">🔵 60-80%:</span> <span className="text-slate-300">Good</span></div>
                <div className="flex items-center gap-2"><span className="text-yellow-400">🟡 40-60%:</span> <span className="text-slate-300">Warning</span></div>
                <div className="flex items-center gap-2"><span className="text-red-400">🔴 &lt;40%:</span> <span className="text-slate-300">Critical</span></div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-400 font-medium">⚠️ Anomaly Rate</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">Percentage of readings outside normal parameters.</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2"><span className="text-green-400">🟢 &lt;5%:</span> <span className="text-slate-300">Excellent</span></div>
                <div className="flex items-center gap-2"><span className="text-blue-400">🔵 5-10%:</span> <span className="text-slate-300">Good</span></div>
                <div className="flex items-center gap-2"><span className="text-yellow-400">🟡 10-15%:</span> <span className="text-slate-300">Warning</span></div>
                <div className="flex items-center gap-2"><span className="text-red-400">🔴 &gt;15%:</span> <span className="text-slate-300">Critical</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 mt-8">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cyan-400 font-medium">📡 Signal Quality</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">Data transmission reliability and accuracy.</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2"><span className="text-green-400">🟢 &gt;90%:</span> <span className="text-slate-300">Excellent</span></div>
                <div className="flex items-center gap-2"><span className="text-blue-400">🔵 80-90%:</span> <span className="text-slate-300">Good</span></div>
                <div className="flex items-center gap-2"><span className="text-yellow-400">🟡 70-80%:</span> <span className="text-slate-300">Warning</span></div>
                <div className="flex items-center gap-2"><span className="text-red-400">🔴 &lt;70%:</span> <span className="text-slate-300">Critical</span></div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 font-medium">⏱️ Response Time</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">Speed of sensor data processing and transmission.</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2"><span className="text-green-400">🟢 &gt;95%:</span> <span className="text-slate-300">Excellent</span></div>
                <div className="flex items-center gap-2"><span className="text-blue-400">🔵 85-95%:</span> <span className="text-slate-300">Good</span></div>
                <div className="flex items-center gap-2"><span className="text-yellow-400">🟡 70-85%:</span> <span className="text-slate-300">Warning</span></div>
                <div className="flex items-center gap-2"><span className="text-red-400">🔴 &lt;70%:</span> <span className="text-slate-300">Critical</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sensor Cards */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-300 flex items-center gap-2">
          🏥 Detailed Health Reports
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(healthMatrix).map(([sensorId, metrics]) => (
            <motion.div
              key={sensorId}
              whileHover={{ scale: 1.02 }}
              className={`rounded-lg p-4 border ${getStatusColor(metrics.status)} transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-mono font-bold">{sensorId}</span>
                <span className="text-lg">{getStatusIcon(metrics.status)}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-medium capitalize ${getStatusColor(metrics.status).split(' ')[0]}`}>
                    {metrics.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Anomaly Rate:</span>
                  <span className={`font-medium ${getMetricColor(metrics.anomalyRate, 'anomaly')}`}>
                    {metrics.anomalyRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Activity:</span>
                  <span className={`font-medium ${getMetricColor(metrics.activity, 'activity')}`}>
                    {metrics.activity.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Value:</span>
                  <span className="font-medium text-slate-300">
                    {metrics.avgValue.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Health Scale Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Health Scale:</span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span>🟢</span>
              <span className="text-green-400">Excellent</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔵</span>
              <span className="text-blue-400">Good</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🟡</span>
              <span className="text-yellow-400">Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔴</span>
              <span className="text-red-400">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 