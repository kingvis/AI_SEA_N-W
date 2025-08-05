'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface AnomalyAnalysisProps {
  anomalies: Array<{
    timestamp: Date
    sensor_id: string
    consecutive_count: number
    severity?: string
    value?: number
  }>
  theme?: any
}

export default function AnomalyAnalysis({ anomalies, theme }: AnomalyAnalysisProps) {
  // Process anomaly data for analysis
  const anomalyStats = useMemo(() => {
    if (!anomalies.length) return { totalAnomalies: 0, bySensor: {}, byHour: {}, trend: [] }

    // Group by sensor
    const bySensor: Record<string, number> = {}
    anomalies.forEach(anomaly => {
      bySensor[anomaly.sensor_id] = (bySensor[anomaly.sensor_id] || 0) + 1
    })

    // Group by hour for trend analysis
    const byHour: Record<number, number> = {}
    anomalies.forEach(anomaly => {
      const hour = anomaly.timestamp.getHours()
      byHour[hour] = (byHour[hour] || 0) + 1
    })

    // Create trend data for last 24 hours
    const trend = []
    const now = new Date()
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourKey = hour.getHours()
      trend.push({
        hour: hourKey,
        count: byHour[hourKey] || 0,
        label: format(hour, 'HH:mm')
      })
    }

    return {
      totalAnomalies: anomalies.length,
      bySensor,
      byHour,
      trend
    }
  }, [anomalies])

  const getSensorColor = (sensorId: string) => {
    if (theme?.sensors?.[sensorId]) {
      return theme.sensors[sensorId].primary
    }
    const fallbackColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
    const sensorKeys = Object.keys(anomalyStats.bySensor)
    const index = sensorKeys.indexOf(sensorId)
    return fallbackColors[index % fallbackColors.length]
  }

  const getSensorName = (sensorId: string) => {
    if (theme?.sensors?.[sensorId]) {
      return `${theme.sensors[sensorId].icon} ${theme.sensors[sensorId].name}`
    }
    return sensorId.replace('sensor_', 'Sensor ')
  }

  const maxTrendValue = Math.max(...anomalyStats.trend.map(t => t.count), 1)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📈 Anomaly Analysis
        </h3>
        <div className="text-sm text-slate-400 bg-slate-700/30 px-3 py-1 rounded-full">
          {anomalyStats.totalAnomalies} anomalies detected
        </div>
      </div>

      {anomalyStats.totalAnomalies === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-slate-400 text-lg">No anomalies detected</p>
            <p className="text-slate-500 text-sm mt-2">All sensors operating normally</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trend Chart */}
          <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30">
            <h4 className="text-sm font-semibold text-slate-300 mb-4">24-Hour Anomaly Trend</h4>
            <div className="relative h-32">
              <svg width="100%" height="100%" className="overflow-visible">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                  <line
                    key={ratio}
                    x1="0"
                    y1={`${ratio * 100}%`}
                    x2="100%"
                    y2={`${ratio * 100}%`}
                    stroke="#475569"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                ))}
                
                {/* Trend line */}
                <motion.path
                  d={anomalyStats.trend.map((point, index) => {
                    const x = (index / (anomalyStats.trend.length - 1)) * 100
                    const y = 100 - (point.count / maxTrendValue) * 100
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
                  }).join(' ')}
                  fill="none"
                  stroke={theme?.anomaly || '#EF4444'}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
                
                {/* Data points */}
                {anomalyStats.trend.map((point, index) => {
                  const x = (index / (anomalyStats.trend.length - 1)) * 100
                  const y = 100 - (point.count / maxTrendValue) * 100
                  return (
                    <motion.circle
                      key={index}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill={theme?.anomaly || '#EF4444'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.02 }}
                    />
                  )
                })}
                
                {/* Y-axis labels */}
                {[0, maxTrendValue / 2, maxTrendValue].map((value, index) => (
                  <text
                    key={value}
                    x="-10"
                    y={`${100 - (value / maxTrendValue) * 100}%`}
                    textAnchor="end"
                    dy="0.35em"
                    fontSize="10"
                    fill="#94A3B8"
                  >
                    {Math.round(value)}
                  </text>
                ))}
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>24h ago</span>
              <span>12h ago</span>
              <span>Now</span>
            </div>
          </div>

          {/* Sensor Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Sensor Chart */}
            <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Anomalies by Sensor</h4>
              <div className="space-y-3">
                {Object.entries(anomalyStats.bySensor)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([sensorId, count], index) => {
                    const percentage = (count / anomalyStats.totalAnomalies) * 100
                    const sensorColor = getSensorColor(sensorId)
                    const sensorName = getSensorName(sensorId)
                    
                    return (
                      <motion.div
                        key={sensorId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: sensorColor }}
                            />
                            <span className="text-sm text-slate-300 font-medium">
                              {sensorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{count}</span>
                            <span className="text-xs text-slate-400">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: sensorColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            </div>

            {/* Recent Anomalies */}
            <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Recent Anomalies</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anomalies.slice(0, 8).map((anomaly, index) => {
                  const sensorColor = getSensorColor(anomaly.sensor_id)
                  const sensorName = getSensorName(anomaly.sensor_id)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sensorColor }}
                        />
                        <span className="text-xs text-slate-300 font-medium">
                          {sensorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {anomaly.value && (
                          <span className="bg-slate-600/40 px-2 py-1 rounded">
                            {anomaly.value.toFixed(1)}
                          </span>
                        )}
                        <span>{format(anomaly.timestamp, 'HH:mm')}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="text-center p-4 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {anomalyStats.totalAnomalies}
              </div>
              <div className="text-xs text-slate-400">Total Anomalies</div>
            </div>
            <div className="text-center p-4 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {Object.keys(anomalyStats.bySensor).length}
              </div>
              <div className="text-xs text-slate-400">Affected Sensors</div>
            </div>
            <div className="text-center p-4 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {Math.max(...Object.values(anomalyStats.byHour), 0)}
              </div>
              <div className="text-xs text-slate-400">Peak Hour Count</div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
} 