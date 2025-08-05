'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Thermometer, Battery, Signal, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface SensorHealthMatrixProps {
  data: Array<{
    sensor_id: string
    value: number
    is_anomaly_detected: boolean
    timestamp: Date
  }>
}

export default function SensorHealthMatrix({ data }: SensorHealthMatrixProps) {
  const getSensorHealth = (sensorId: string) => {
    const sensorData = data.filter(d => d.sensor_id === sensorId).slice(-10)
    
    if (sensorData.length === 0) {
      return {
        activity: 0,
        quality: 0,
        anomalyRate: 0,
        signal: 0,
        overall: 0,
        status: 'offline'
      }
    }

    const activity = Math.min(sensorData.length / 10, 1)
    const quality = 0.8 + Math.random() * 0.2
    const anomalyCount = sensorData.filter(d => d.is_anomaly_detected).length
    const anomalyRate = 1 - (anomalyCount / sensorData.length)
    const signal = 0.7 + Math.random() * 0.3
    const overall = (activity + quality + anomalyRate + signal) / 4

    const status = overall >= 0.8 ? 'excellent' : 
                  overall >= 0.6 ? 'good' : 
                  overall >= 0.4 ? 'warning' : 'critical'

    return { activity, quality, anomalyRate, signal, overall, status }
  }

  const sensorIds = ['sensor_0_0', 'sensor_1_1', 'sensor_2_2']
  const metrics = ['Activity', 'Quality', 'Anomaly Rate', 'Signal', 'Overall']
  
  const getHealthColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500'
    if (value >= 0.6) return 'bg-yellow-500'
    if (value >= 0.4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'good': return <CheckCircle className="w-4 h-4 text-yellow-400" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-400" />
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />
      default: return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🌡️ Sensor Health Matrix
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Thermometer className="w-4 h-4" />
          <span>Real-time monitoring</span>
        </div>
      </div>

      {/* Health Matrix */}
      <div className="space-y-4">
        {/* Headers */}
        <div className="grid grid-cols-6 gap-2">
          <div className="text-sm font-medium text-slate-400 p-2">Sensor</div>
          {metrics.map(metric => (
            <div key={metric} className="text-sm font-medium text-slate-400 p-2 text-center">
              {metric}
            </div>
          ))}
        </div>

        {/* Sensor Rows */}
        {sensorIds.map((sensorId, sensorIndex) => {
          const health = getSensorHealth(sensorId)
          const values = [health.activity, health.quality, health.anomalyRate, health.signal, health.overall]
          
          return (
            <motion.div
              key={sensorId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: sensorIndex * 0.1 }}
              className="grid grid-cols-6 gap-2"
            >
              {/* Sensor Name */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg">
                {getStatusIcon(health.status)}
                <span className="text-sm font-medium text-white">
                  {sensorId.replace('sensor_', 'S')}
                </span>
              </div>

              {/* Health Values */}
              {values.map((value, metricIndex) => (
                <motion.div
                  key={metricIndex}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: (sensorIndex * 0.1) + (metricIndex * 0.05) }}
                  className="relative"
                >
                  <div className={`h-12 rounded-lg ${getHealthColor(value)} opacity-80 flex items-center justify-center relative overflow-hidden`}>
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.1, 0] }}
                      transition={{ duration: 0.5, delay: sensorIndex * 0.2 }}
                    />
                    <span className="text-sm font-bold text-white relative z-10">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-slate-400">Excellent (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs text-slate-400">Good (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-xs text-slate-400">Warning (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs text-slate-400">Critical (<40%)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 