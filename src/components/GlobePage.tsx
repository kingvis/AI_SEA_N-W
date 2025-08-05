'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Globe3D from './Globe3D'
import { ArrowLeft, Download, Settings, Filter, Search, Globe } from 'lucide-react'

interface SensorData {
  id: string
  lat: number
  lng: number
  depth: number
  status: 'active' | 'warning' | 'critical' | 'offline'
  sensorType: 'temperature' | 'pressure' | 'vibration' | 'electrical'
  value: number
  lastReading: string
  cableName: string
  anomalyDetected?: boolean
}

interface GlobePageProps {
  onBack?: () => void
}

export default function GlobePage({ onBack }: GlobePageProps) {
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sensorTypeFilter, setSensorTypeFilter] = useState<string>('all')
  const [showCables, setShowCables] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const [sensors, setSensors] = useState<SensorData[]>([])

  // Enhanced sensor data with more realistic global coverage
  useEffect(() => {
    const enhancedSensors: SensorData[] = [
      // Trans-Atlantic Cables
      { id: 'TA1-NYC', lat: 40.7589, lng: -73.9876, depth: 1200, status: 'active', sensorType: 'temperature', value: 4.2, lastReading: '2024-01-15T10:30:00Z', cableName: 'TAT-14' },
      { id: 'TA1-MID', lat: 47.7511, lng: -42.3601, depth: 3800, status: 'warning', sensorType: 'pressure', value: 385.6, lastReading: '2024-01-15T10:29:45Z', cableName: 'TAT-14', anomalyDetected: true },
      { id: 'TA1-LIS', lat: 38.7223, lng: -9.1393, depth: 2100, status: 'active', sensorType: 'vibration', value: 0.8, lastReading: '2024-01-15T10:30:15Z', cableName: 'TAT-14' },
      { id: 'TA2-MIA', lat: 25.7617, lng: -80.1918, depth: 900, status: 'active', sensorType: 'electrical', value: 12.8, lastReading: '2024-01-15T10:29:30Z', cableName: 'Americas-II' },
      { id: 'TA2-BRA', lat: -22.9068, lng: -43.1729, depth: 1500, status: 'critical', sensorType: 'temperature', value: 7.1, lastReading: '2024-01-15T10:25:00Z', cableName: 'Americas-II', anomalyDetected: true },
      
      // Trans-Pacific Cables
      { id: 'TP1-SF', lat: 37.7749, lng: -122.4194, depth: 900, status: 'active', sensorType: 'electrical', value: 12.3, lastReading: '2024-01-15T10:29:30Z', cableName: 'TPC-5' },
      { id: 'TP1-HAW', lat: 21.3099, lng: -157.8583, depth: 4200, status: 'warning', sensorType: 'temperature', value: 8.9, lastReading: '2024-01-15T10:25:00Z', cableName: 'TPC-5' },
      { id: 'TP1-TOK', lat: 35.6895, lng: 139.6917, depth: 1800, status: 'active', sensorType: 'pressure', value: 180.4, lastReading: '2024-01-15T10:30:45Z', cableName: 'TPC-5' },
      { id: 'TP2-LA', lat: 33.9425, lng: -118.4081, depth: 800, status: 'active', sensorType: 'vibration', value: 1.2, lastReading: '2024-01-15T10:31:00Z', cableName: 'PC-1' },
      { id: 'TP2-SYD', lat: -33.8688, lng: 151.2093, depth: 2200, status: 'offline', sensorType: 'electrical', value: 0.0, lastReading: '2024-01-15T09:45:00Z', cableName: 'PC-1' },
      
      // Europe-Asia Cables
      { id: 'EA1-LON', lat: 51.5074, lng: -0.1278, depth: 600, status: 'active', sensorType: 'temperature', value: 5.8, lastReading: '2024-01-15T10:30:20Z', cableName: 'SEA-ME-WE 3' },
      { id: 'EA1-CAI', lat: 30.0444, lng: 31.2357, depth: 2900, status: 'active', sensorType: 'pressure', value: 290.1, lastReading: '2024-01-15T10:29:20Z', cableName: 'SEA-ME-WE 3' },
      { id: 'EA1-DUB', lat: 25.2048, lng: 55.2708, depth: 3500, status: 'warning', sensorType: 'electrical', value: 9.8, lastReading: '2024-01-15T10:28:10Z', cableName: 'SEA-ME-WE 3' },
      { id: 'EA1-MUM', lat: 19.0760, lng: 72.8777, depth: 2800, status: 'active', sensorType: 'vibration', value: 0.6, lastReading: '2024-01-15T10:30:50Z', cableName: 'SEA-ME-WE 3' },
      { id: 'EA1-SIN', lat: 1.3521, lng: 103.8198, depth: 2200, status: 'active', sensorType: 'pressure', value: 220.7, lastReading: '2024-01-15T10:30:30Z', cableName: 'SEA-ME-WE 3' },
      
      // Asia-Pacific Cables
      { id: 'AP1-HK', lat: 22.3193, lng: 114.1694, depth: 1400, status: 'active', sensorType: 'temperature', value: 6.5, lastReading: '2024-01-15T10:30:10Z', cableName: 'APCN-2' },
      { id: 'AP1-MAN', lat: 14.5995, lng: 120.9842, depth: 3200, status: 'critical', sensorType: 'electrical', value: 15.2, lastReading: '2024-01-15T10:20:00Z', cableName: 'APCN-2', anomalyDetected: true },
      { id: 'AP1-SEO', lat: 37.5665, lng: 126.9780, depth: 1900, status: 'active', sensorType: 'vibration', value: 0.9, lastReading: '2024-01-15T10:31:15Z', cableName: 'APCN-2' },
      
      // Arctic Cables
      { id: 'AR1-REY', lat: 64.1466, lng: -21.9426, depth: 1100, status: 'active', sensorType: 'temperature', value: 2.1, lastReading: '2024-01-15T10:30:40Z', cableName: 'FARICE-1' },
      { id: 'AR1-TRO', lat: 69.6496, lng: 18.9564, depth: 800, status: 'warning', sensorType: 'pressure', value: 85.3, lastReading: '2024-01-15T10:28:00Z', cableName: 'FARICE-1' },
      
      // Indian Ocean Cables
      { id: 'IO1-MUR', lat: -20.3484, lng: 57.5522, depth: 3800, status: 'active', sensorType: 'electrical', value: 11.7, lastReading: '2024-01-15T10:30:25Z', cableName: 'SAFE' },
      { id: 'IO1-CPT', lat: -33.9249, lng: 18.4241, depth: 2600, status: 'active', sensorType: 'temperature', value: 3.9, lastReading: '2024-01-15T10:29:55Z', cableName: 'SAFE' },
    ]
    
    setSensors(enhancedSensors)
  }, [])

  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch = sensor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.cableName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sensor.status === statusFilter
    const matchesType = sensorTypeFilter === 'all' || sensor.sensorType === sensorTypeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSensorClick = (sensor: SensorData) => {
    setSelectedSensor(sensor)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(filteredSensors, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sensor-data.json'
    link.click()
  }

  const getStatusCounts = () => {
    return {
      active: sensors.filter(s => s.status === 'active').length,
      warning: sensors.filter(s => s.status === 'warning').length,
      critical: sensors.filter(s => s.status === 'critical').length,
      offline: sensors.filter(s => s.status === 'offline').length,
      anomalies: sensors.filter(s => s.anomalyDetected).length
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            )}
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">🌍 Global Sensor Network</h1>
                <p className="text-slate-400">Interactive 3D visualization of underwater cable sensors</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status Summary */}
            <div className="flex items-center gap-4 bg-slate-700/50 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">{statusCounts.active}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 text-sm">{statusCounts.warning}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-400 text-sm">{statusCounts.critical}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-400 text-sm">{statusCounts.offline}</span>
              </div>
            </div>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sensors or cables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="offline">Offline</option>
          </select>
          
          {/* Type Filter */}
          <select
            value={sensorTypeFilter}
            onChange={(e) => setSensorTypeFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="vibration">Vibration</option>
            <option value="electrical">Electrical</option>
          </select>
          
          {/* View Options */}
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showCables}
                onChange={(e) => setShowCables(e.target.checked)}
                className="rounded"
              />
              Show Cables
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="rounded"
              />
              Auto Rotate
            </label>
          </div>
        </div>
      </div>

      {/* Globe Container */}
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="h-[calc(100vh-200px)]"
        >
          <Globe3D
            sensors={filteredSensors}
            onSensorClick={handleSensorClick}
            showCables={showCables}
            autoRotate={autoRotate}
          />
        </motion.div>
      </div>

      {/* Sensor List Sidebar */}
      {selectedSensor && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed right-4 top-20 bottom-4 w-96 bg-slate-800/95 backdrop-blur-md rounded-lg border border-slate-700/50 p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Sensor Details</h3>
            <button
              onClick={() => setSelectedSensor(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">{selectedSensor.id}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white capitalize">{selectedSensor.sensorType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-medium ${
                    selectedSensor.status === 'active' ? 'text-green-400' :
                    selectedSensor.status === 'warning' ? 'text-yellow-400' :
                    selectedSensor.status === 'critical' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {selectedSensor.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cable:</span>
                  <span className="text-white">{selectedSensor.cableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white font-mono">
                    {selectedSensor.lat.toFixed(4)}°, {selectedSensor.lng.toFixed(4)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Depth:</span>
                  <span className="text-white">{selectedSensor.depth}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Value:</span>
                  <span className="text-white font-mono">
                    {selectedSensor.value}
                    {selectedSensor.sensorType === 'temperature' ? '°C' :
                     selectedSensor.sensorType === 'pressure' ? ' bar' :
                     selectedSensor.sensorType === 'vibration' ? ' Hz' : ' V'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Reading:</span>
                  <span className="text-white">
                    {new Date(selectedSensor.lastReading).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {selectedSensor.anomalyDetected && (
                <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <span>⚠️</span>
                    <span className="font-medium">Anomaly Detected</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">
                    This sensor is showing unusual readings. Immediate inspection recommended.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 
 