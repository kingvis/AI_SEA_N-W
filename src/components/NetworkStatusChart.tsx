'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Wifi, WifiOff, Shield } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend)

interface NetworkStatusChartProps {
  networkStats: {
    active_sensors?: number
    timeout_sensors?: number
  }
}

export default function NetworkStatusChart({ networkStats }: NetworkStatusChartProps) {
  const activeSensors = networkStats.active_sensors || 0
  const timeoutSensors = networkStats.timeout_sensors || 0
  const totalSensors = activeSensors + timeoutSensors

  const data = {
    labels: ['Active Sensors', 'Timeout Sensors'],
    datasets: [
      {
        data: [activeSensors, timeoutSensors],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    cutout: '60%'
  }

  const healthPercentage = totalSensors > 0 ? (activeSensors / totalSensors) * 100 : 0
  const healthStatus = healthPercentage >= 90 ? 'excellent' : 
                      healthPercentage >= 75 ? 'good' : 
                      healthPercentage >= 50 ? 'warning' : 'critical'

  const healthColors = {
    excellent: 'text-green-400',
    good: 'text-blue-400', 
    warning: 'text-yellow-400',
    critical: 'text-red-400'
  }

  const healthIcons = {
    excellent: '🟢',
    good: '🟡',
    warning: '🟠', 
    critical: '🔴'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🌐 Network Status
        </h3>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 text-green-400"
        >
          <Wifi className="w-4 h-4" />
          <span className="text-sm">Online</span>
        </motion.div>
      </div>

      <div className="relative h-48 mb-4">
        {totalSensors > 0 ? (
          <>
            <Doughnut data={data} options={options} />
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  key={totalSensors}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold text-white"
                >
                  {totalSensors}
                </motion.div>
                <div className="text-sm text-slate-400">Total Sensors</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <WifiOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No sensors detected</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Active</span>
          </div>
          <motion.div 
            key={activeSensors}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-green-400 mt-1"
          >
            {activeSensors}
          </motion.div>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Timeout</span>
          </div>
          <motion.div 
            key={timeoutSensors}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-red-400 mt-1"
          >
            {timeoutSensors}
          </motion.div>
        </div>
      </div>

      {/* Health Status */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Network Health</span>
          </div>
          <div className={`flex items-center gap-1 ${healthColors[healthStatus]}`}>
            <span className="text-sm">{healthIcons[healthStatus]}</span>
            <span className="text-sm font-medium capitalize">{healthStatus}</span>
            <span className="text-xs">({healthPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 