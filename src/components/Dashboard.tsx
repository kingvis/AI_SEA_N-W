'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import StatsCards from './StatsCards'
import SensorReadingsChart from './SensorReadingsChart'
import NetworkStatusChart from './NetworkStatusChart'
import SensorHealthMatrix from './SensorHealthMatrix'
import AlertsTimeline from './AlertsTimeline'
import AnomalyAnalysis from './AnomalyAnalysis'
import SystemStatistics from './SystemStatistics'
import FallbackGlobe from './FallbackGlobe'

interface DashboardData {
  sensorReadings: any[]
  networkStats: any
  alerts: any[]
  anomalies: any[]
  systemHealth: any
}

interface DashboardProps {
  onOpenGlobe?: () => void
}

export default function Dashboard({ onOpenGlobe }: DashboardProps) {
  const [data, setData] = useState<DashboardData>({
    sensorReadings: [],
    networkStats: {},
    alerts: [],
    anomalies: [],
    systemHealth: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showGlobe, setShowGlobe] = useState(true) // Changed to true for testing

  // Generate demo data (replace with real API calls)
  useEffect(() => {
    const generateDemoData = () => {
      const sensorIds = ['sensor_0_0', 'sensor_1_1', 'sensor_2_2']
      const now = new Date()
      
      const sensorReadings = []
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(now.getTime() - i * 60000) // 1 minute intervals
        sensorIds.forEach(sensorId => {
          sensorReadings.push({
            timestamp,
            sensor_id: sensorId,
            value: 10 + Math.random() * 10,
            is_anomaly_detected: Math.random() < 0.1
          })
        })
      }

      const networkStats = {
        active_sensors: 3,
        timeout_sensors: 0,
        total_readings: 1500 + Math.floor(Math.random() * 500),
        anomalies_detected: 25 + Math.floor(Math.random() * 20),
        alerts_raised: 5 + Math.floor(Math.random() * 10),
        anomaly_rate: 0.05 + Math.random() * 0.1,
        uptime_seconds: 86400 + Math.random() * 86400
      }

      const alerts = []
      for (let i = 0; i < 10; i++) {
        alerts.push({
          id: `alert_${i}`,
          timestamp: new Date(now.getTime() - i * 300000), // 5 minute intervals
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          sensor_id: sensorIds[Math.floor(Math.random() * sensorIds.length)],
          description: `Anomaly detected in ${sensorIds[Math.floor(Math.random() * sensorIds.length)]}`
        })
      }

      const anomalies = []
      for (let i = 0; i < 20; i++) {
        anomalies.push({
          timestamp: new Date(now.getTime() - i * 180000), // 3 minute intervals
          sensor_id: sensorIds[Math.floor(Math.random() * sensorIds.length)],
          consecutive_count: Math.floor(Math.random() * 5) + 1
        })
      }

      setData({
        sensorReadings,
        networkStats,
        alerts,
        anomalies,
        systemHealth: {
          overall: Math.random() > 0.3 ? 'excellent' : Math.random() > 0.1 ? 'good' : 'warning',
          metrics: {
            availability: 95 + Math.random() * 5,
            performance: 90 + Math.random() * 10,
            security: 98 + Math.random() * 2
          }
        }
      })
      setIsLoading(false)
    }

    generateDemoData()
    const interval = setInterval(generateDemoData, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header 
        onDeepSeaNetworkClick={() => {
          console.log('Deep Sea Network button clicked! Current showGlobe:', showGlobe)
          setShowGlobe(!showGlobe)
          console.log('showGlobe will be set to:', !showGlobe)
        }} 
        isGlobeVisible={showGlobe}
      />
      
      {/* Test Button for Debugging */}
      <div className="container mx-auto px-4 py-2">
        <button
          onClick={() => {
            console.log('TEST BUTTON: Current showGlobe:', showGlobe)
            setShowGlobe(!showGlobe)
            console.log('TEST BUTTON: Setting showGlobe to:', !showGlobe)
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          TEST: Toggle Globe (Currently: {showGlobe ? 'VISIBLE' : 'HIDDEN'})
        </button>
      </div>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards networkStats={data.networkStats} />
        
        {/* 3D Globe - Show/Hide based on state */}
        {showGlobe && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <FallbackGlobe />
          </motion.div>
        )}
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Sensor Readings Chart - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <SensorReadingsChart data={data.sensorReadings} />
          </div>
          
          {/* Network Status */}
          <div>
            <NetworkStatusChart networkStats={data.networkStats} />
          </div>
          
          {/* Sensor Health Matrix - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <SensorHealthMatrix data={data.sensorReadings} />
          </div>
          
          {/* Alerts Timeline */}
          <div>
            <AlertsTimeline alerts={data.alerts} />
          </div>
          
          {/* Anomaly Analysis - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <AnomalyAnalysis anomalies={data.anomalies} />
          </div>
          
          {/* System Statistics */}
          <div>
            <SystemStatistics 
              networkStats={data.networkStats}
              systemHealth={data.systemHealth}
            />
          </div>
        </div>
      </div>
      
      {/* Floating Globe Button */}
      {onOpenGlobe && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onOpenGlobe();
            console.log('Globe button clicked!');
          }}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg backdrop-blur-md border border-blue-500/50 transition-all duration-300 group z-50"
          title="Open Full-Screen Globe View"
        >
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="sr-only">Open Globe View</span>
        </motion.button>
      )}
    </div>
  )
} 