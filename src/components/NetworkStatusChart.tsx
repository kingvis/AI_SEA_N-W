'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface NetworkStatusChartProps {
  networkStats: {
    activeSensors?: number
    timeoutSensors?: number
    totalSensors?: number
    total_readings?: number
    anomaly_rate?: number
  }
  theme?: any
}

export default function NetworkStatusChart({ networkStats, theme }: NetworkStatusChartProps) {
  const { activeSensors = 0, timeoutSensors = 0, totalSensors = 0 } = networkStats
  const total_sensors = totalSensors || (activeSensors + timeoutSensors)
  
  // Pie chart data
  const pieData = useMemo(() => {
    if (total_sensors === 0) return []
    
    const data = [
      {
        label: 'Active Sensors',
        value: activeSensors,
        percentage: (activeSensors / total_sensors) * 100,
        color: theme?.status?.excellent?.bg || '#10B981',
        icon: '🟢'
      },
      {
        label: 'Timeout Sensors',
        value: timeoutSensors,
        percentage: (timeoutSensors / total_sensors) * 100,
        color: theme?.status?.warning?.bg || '#F59E0B',
        icon: '🟡'
      }
    ].filter(item => item.value > 0)
    
    return data
  }, [activeSensors, timeoutSensors, total_sensors, theme])

  // Generate pie chart paths
  const generatePieChart = (data: typeof pieData, radius: number) => {
    let cumulativePercentage = 0
    
    return data.map((slice, index) => {
      const startAngle = (cumulativePercentage * 360) / 100
      const endAngle = ((cumulativePercentage + slice.percentage) * 360) / 100
      
      cumulativePercentage += slice.percentage
      
      const x1 = Math.cos((startAngle * Math.PI) / 180) * radius
      const y1 = Math.sin((startAngle * Math.PI) / 180) * radius
      const x2 = Math.cos((endAngle * Math.PI) / 180) * radius
      const y2 = Math.sin((endAngle * Math.PI) / 180) * radius
      
      const largeArcFlag = slice.percentage > 50 ? 1 : 0
      
      const pathData = [
        `M 0 0`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      return {
        ...slice,
        pathData,
        startAngle,
        endAngle
      }
    })
  }

  const radius = 85
  const pieSlices = generatePieChart(pieData, radius)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(51, 65, 85, 0.6)' }}
      className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:border-slate-600/70 hover:shadow-2xl group"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🌐 Network Status
        </h3>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="text-sm text-blue-400"
        >
          🔄
        </motion.div>
      </div>

      {total_sensors === 0 ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-slate-400 text-lg">No sensor data available</p>
            <p className="text-slate-500 text-sm mt-2">Waiting for sensor connections...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <div className="relative">
              <svg width="220" height="220" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius + 5}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2"
                  opacity="0.2"
                />
                
                <g transform="translate(110, 110)">
                  {/* Pie slices */}
                  {pieSlices.map((slice, index) => (
                    <motion.path
                      key={slice.label}
                      d={slice.pathData}
                      fill={slice.color}
                      stroke="#1E293B"
                      strokeWidth="3"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.9 }}
                      transition={{ 
                        duration: 1, 
                        delay: index * 0.3,
                        type: "spring",
                        bounce: 0.2
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        opacity: 1,
                        transition: { duration: 0.2 }
                      }}
                      className="cursor-pointer"
                      filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))"
                    />
                  ))}
                </g>
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-3xl font-bold text-white"
                  >
                    {total_sensors}
                  </motion.div>
                  <div className="text-xs text-slate-400 font-medium">Total Sensors</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Stats */}
          <div className="space-y-3">
            {pieData.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 border border-slate-600/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-200 font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {item.value}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-600/40 px-2 py-0.5 rounded-full">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Network Metrics */}
          <div className="pt-4 border-t border-slate-700/50">
            <div className="grid grid-cols-1 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-between p-2 bg-slate-700/20 rounded-lg"
              >
                <span className="text-sm text-slate-300 flex items-center gap-2 font-medium">
                  📈 Total Readings
                </span>
                <span className="text-sm font-bold text-green-400">
                  {(networkStats.total_readings || 0).toLocaleString()}
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex items-center justify-between p-2 bg-slate-700/20 rounded-lg"
              >
                <span className="text-sm text-slate-300 flex items-center gap-2 font-medium">
                  ⚠️ Anomaly Rate
                </span>
                <span className={`text-sm font-bold ${
                  (networkStats.anomaly_rate || 0) > 0.1 ? 'text-red-400' : 
                  (networkStats.anomaly_rate || 0) > 0.05 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {((networkStats.anomaly_rate || 0) * 100).toFixed(1)}%
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center justify-between p-2 bg-slate-700/20 rounded-lg"
              >
                <span className="text-sm text-slate-300 flex items-center gap-2 font-medium">
                  🛡️ Network Health
                </span>
                <span className={`text-sm font-bold ${
                  timeoutSensors === 0 ? 'text-green-400' : 
                  timeoutSensors <= total_sensors * 0.2 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {timeoutSensors === 0 ? 'Excellent' : 
                   timeoutSensors <= total_sensors * 0.2 ? 'Good' : 'Critical'}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-center pt-2"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              timeoutSensors === 0 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                timeoutSensors === 0 ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              System {timeoutSensors === 0 ? 'Operational' : 'Warning'}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
} 