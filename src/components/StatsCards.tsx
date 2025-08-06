'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertTriangle, Wifi, Clock } from 'lucide-react'

interface StatsCardsProps {
  networkStats: {
    activeSensors?: number
    total_readings?: number
    anomalies_detected?: number
    alerts_raised?: number
    anomaly_rate?: number
    uptime_seconds?: number
  }
  onAnomalyClick?: () => void
}

// Smooth counter component for uptime
const SmoothCounter = ({ value, isUptime = false }: { value: string | number, isUptime?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(value)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsChanging(true)
      setTimeout(() => {
        setDisplayValue(value)
        setIsChanging(false)
      }, isUptime ? 50 : 150) // Faster transition for uptime
    }
  }, [value, displayValue, isUptime])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={displayValue}
        initial={{ 
          opacity: isUptime ? 0.7 : 0, 
          y: isUptime ? 0 : 10,
          scale: isUptime ? 0.98 : 0.8
        }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: 1
        }}
        exit={{ 
          opacity: isUptime ? 0.7 : 0, 
          y: isUptime ? 0 : -10,
          scale: isUptime ? 0.98 : 0.8
        }}
        transition={{ 
          duration: isUptime ? 0.2 : 0.3,
          ease: "easeInOut"
        }}
        className={isChanging && isUptime ? 'text-blue-300' : ''}
      >
        {displayValue}
      </motion.span>
    </AnimatePresence>
  )
}

export default function StatsCards({ networkStats, onAnomalyClick }: StatsCardsProps) {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }

  const stats = [
    {
      title: 'Active Sensors',
      value: networkStats.activeSensors || 0,
      icon: Wifi,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Total Readings',
      value: (networkStats.total_readings || 0).toLocaleString(),
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Anomalies Detected',
      value: networkStats.anomalies_detected || 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    {
      title: 'System Uptime',
      value: formatUptime(networkStats.uptime_seconds || 0),
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05, 
              y: -4,
              boxShadow: `0 10px 30px -5px ${stat.color.split(' ')[1].replace('to-', '').replace('-500', '')}40`,
              backgroundColor: 'rgba(51, 65, 85, 0.8)'
            }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-xl bg-slate-800/50 backdrop-blur-md border ${stat.borderColor} ${stat.bgColor} relative overflow-hidden ${
              stat.title === 'Anomalies Detected' ? 'cursor-pointer' : 'cursor-default'
            } shadow-lg transition-all duration-300 group`}
            onClick={stat.title === 'Anomalies Detected' && networkStats.anomalies_detected ? onAnomalyClick : undefined}
          >
            {/* Enhanced Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            <motion.div 
              className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-xl`}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                <div className="text-2xl font-bold text-white mt-1">
                  {stat.title === 'System Uptime' ? (
                    <SmoothCounter value={stat.value} isUptime={true} />
                  ) : (
                    <motion.span
                      key={stat.value}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <SmoothCounter value={stat.value} isUptime={false} />
                    </motion.span>
                  )}
                </div>
              </div>
              
              <motion.div 
                className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                animate={{ 
                  y: index === 0 ? [0, -2, 0] : 
                     index === 1 ? [0, 1, 0] : 
                     index === 2 ? [0, -1, 0] : [0, 2, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            
            {/* Anomaly Rate Indicator for Anomalies Card */}
            {stat.title === 'Anomalies Detected' && networkStats.anomaly_rate && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Rate:</span>
                  <span className={`font-medium ${
                    networkStats.anomaly_rate < 0.05 ? 'text-green-400' : 
                    networkStats.anomaly_rate < 0.1 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(networkStats.anomaly_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                  <motion.div 
                    className={`h-1.5 rounded-full ${
                      networkStats.anomaly_rate < 0.05 ? 'bg-green-400' : 
                      networkStats.anomaly_rate < 0.1 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(networkStats.anomaly_rate * 100 * 5, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}