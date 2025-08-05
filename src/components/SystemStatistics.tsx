'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Server, Activity, Shield, Clock, Cpu, HardDrive, Zap } from 'lucide-react'

interface SystemStatisticsProps {
  networkStats: {
    uptime_seconds?: number
    total_readings?: number
    anomalies_detected?: number
    alerts_raised?: number
    anomaly_rate?: number
    active_sensors?: number
    timeout_sensors?: number
  }
  systemHealth: {
    overall: string
    metrics: {
      availability: number
      performance: number
      security: number
    }
  }
}

export default function SystemStatistics({ networkStats, systemHealth }: SystemStatisticsProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🟢'
      case 'good': return '🟡'
      case 'warning': return '🟠'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  const uptime = networkStats.uptime_seconds || 0
  const totalSensors = (networkStats.active_sensors || 0) + (networkStats.timeout_sensors || 0)
  const activeRatio = totalSensors > 0 ? (networkStats.active_sensors || 0) / totalSensors : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📊 System Statistics
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Server className="w-4 h-4" />
          <span>Live Dashboard</span>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          🔑 Key Performance Indicators
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Total Readings</span>
            </div>
            <motion.div
              key={networkStats.total_readings}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-blue-400"
            >
              {(networkStats.total_readings || 0).toLocaleString()}
            </motion.div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">System Uptime</span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {formatUptime(uptime)}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">Anomaly Rate</span>
            </div>
            <div className="text-lg font-bold text-orange-400">
              {((networkStats.anomaly_rate || 0) * 100).toFixed(1)}%
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Active Sensors</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {networkStats.active_sensors || 0}/{totalSensors}
            </div>
          </motion.div>
        </div>
      </div>

      {/* System Health Metrics */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          💊 System Health Metrics
        </h4>
        
        <div className="space-y-3">
          {Object.entries(systemHealth.metrics).map(([metric, value]) => {
            const icons = {
              availability: Cpu,
              performance: Activity,
              security: Shield
            }
            const Icon = icons[metric as keyof typeof icons]
            const color = value >= 95 ? 'green' : value >= 85 ? 'blue' : value >= 70 ? 'yellow' : 'red'
            
            return (
              <div key={metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                    <span className="text-sm text-slate-300 capitalize">{metric}</span>
                  </div>
                  <span className={`text-sm font-medium text-${color}-400`}>
                    {value.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-${color}-400`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Overall Health Status */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Overall System Health</span>
          </div>
          <motion.div 
            className={`flex items-center gap-2 ${getHealthColor(systemHealth.overall)}`}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm">{getHealthIcon(systemHealth.overall)}</span>
            <span className="text-sm font-medium capitalize">{systemHealth.overall}</span>
          </motion.div>
        </div>
        
        {/* Additional System Info */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">🕐 Last Update:</span>
              <span className="text-slate-300 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">📈 Sensor Availability:</span>
              <span className="text-slate-300 font-medium">
                {(activeRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">🚨 Total Alerts:</span>
              <span className="text-slate-300 font-medium">
                {networkStats.alerts_raised || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 