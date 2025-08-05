'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Globe, MapPin, Waves, Zap, AlertTriangle, Eye, RotateCcw } from 'lucide-react'

// Dynamically import Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

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

interface CableRoute {
  id: string
  name: string
  coordinates: [number, number][]
  status: 'operational' | 'maintenance' | 'fault'
  sensors: SensorData[]
}

interface Globe3DProps {
  sensors: SensorData[]
  cables?: CableRoute[]
  onSensorClick?: (sensor: SensorData) => void
  showCables?: boolean
  showOceanFloor?: boolean
  autoRotate?: boolean
}

export default function Globe3D({ 
  sensors = [], 
  cables = [], 
  onSensorClick,
  showCables = true,
  showOceanFloor = true,
  autoRotate = true 
}: Globe3DProps) {
  const globeRef = useRef<any>()
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null)
  const [globeReady, setGlobeReady] = useState(false)
  const [viewMode, setViewMode] = useState<'sensors' | 'cables' | 'both'>('both')
  const [hoveredSensor, setHoveredSensor] = useState<SensorData | null>(null)

  // Sample underwater cable routes (major submarine internet cables)
  const defaultCables: CableRoute[] = [
    {
      id: 'trans-atlantic-1',
      name: 'Trans-Atlantic Cable 1',
      coordinates: [
        [-73.9876, 40.7589], // New York
        [-42.3601, 47.7511], // Mid-Atlantic
        [-9.1393, 38.7223],  // Lisbon
      ],
      status: 'operational',
      sensors: sensors.filter(s => s.cableName === 'Trans-Atlantic Cable 1')
    },
    {
      id: 'trans-pacific-1',
      name: 'Trans-Pacific Cable 1',
      coordinates: [
        [-122.4194, 37.7749], // San Francisco
        [-157.8583, 21.3099], // Hawaii
        [139.6917, 35.6895],  // Tokyo
      ],
      status: 'operational',
      sensors: sensors.filter(s => s.cableName === 'Trans-Pacific Cable 1')
    },
    {
      id: 'europe-asia-1',
      name: 'Europe-Asia Cable 1',
      coordinates: [
        [2.3522, 48.8566],    // Paris
        [31.2357, 30.0444],   // Cairo
        [55.2708, 25.2048],   // Dubai
        [77.1025, 28.7041],   // Delhi
        [103.8198, 1.3521],   // Singapore
      ],
      status: 'maintenance',
      sensors: sensors.filter(s => s.cableName === 'Europe-Asia Cable 1')
    }
  ]

  // Generate sample sensor data if none provided
  const defaultSensors: SensorData[] = [
    // Trans-Atlantic Cable sensors
    { id: 'TA1-S1', lat: 40.7589, lng: -73.9876, depth: 1200, status: 'active', sensorType: 'temperature', value: 4.2, lastReading: '2024-01-15T10:30:00Z', cableName: 'Trans-Atlantic Cable 1' },
    { id: 'TA1-S2', lat: 47.7511, lng: -42.3601, depth: 3800, status: 'warning', sensorType: 'pressure', value: 385.6, lastReading: '2024-01-15T10:29:45Z', cableName: 'Trans-Atlantic Cable 1', anomalyDetected: true },
    { id: 'TA1-S3', lat: 38.7223, lng: -9.1393, depth: 2100, status: 'active', sensorType: 'vibration', value: 0.8, lastReading: '2024-01-15T10:30:15Z', cableName: 'Trans-Atlantic Cable 1' },
    
    // Trans-Pacific Cable sensors
    { id: 'TP1-S1', lat: 37.7749, lng: -122.4194, depth: 900, status: 'active', sensorType: 'electrical', value: 12.3, lastReading: '2024-01-15T10:29:30Z', cableName: 'Trans-Pacific Cable 1' },
    { id: 'TP1-S2', lat: 21.3099, lng: -157.8583, depth: 4200, status: 'critical', sensorType: 'temperature', value: 8.9, lastReading: '2024-01-15T10:25:00Z', cableName: 'Trans-Pacific Cable 1', anomalyDetected: true },
    { id: 'TP1-S3', lat: 35.6895, lng: 139.6917, depth: 1800, status: 'active', sensorType: 'pressure', value: 180.4, lastReading: '2024-01-15T10:30:45Z', cableName: 'Trans-Pacific Cable 1' },
    
    // Europe-Asia Cable sensors
    { id: 'EA1-S1', lat: 48.8566, lng: 2.3522, depth: 800, status: 'offline', sensorType: 'vibration', value: 0.0, lastReading: '2024-01-15T09:45:00Z', cableName: 'Europe-Asia Cable 1' },
    { id: 'EA1-S2', lat: 30.0444, lng: 31.2357, depth: 2900, status: 'active', sensorType: 'temperature', value: 6.1, lastReading: '2024-01-15T10:29:20Z', cableName: 'Europe-Asia Cable 1' },
    { id: 'EA1-S3', lat: 25.2048, lng: 55.2708, depth: 3500, status: 'warning', sensorType: 'electrical', value: 9.8, lastReading: '2024-01-15T10:28:10Z', cableName: 'Europe-Asia Cable 1' },
    { id: 'EA1-S4', lat: 1.3521, lng: 103.8198, depth: 2200, status: 'active', sensorType: 'pressure', value: 220.7, lastReading: '2024-01-15T10:30:30Z', cableName: 'Europe-Asia Cable 1' },
  ]

  const allSensors = sensors.length > 0 ? sensors : defaultSensors
  const allCables = cables.length > 0 ? cables : defaultCables

  const getSensorColor = (sensor: SensorData) => {
    if (sensor.anomalyDetected) return '#FF4444'
    switch (sensor.status) {
      case 'active': return '#00FF88'
      case 'warning': return '#FFB800'
      case 'critical': return '#FF4444'
      case 'offline': return '#888888'
      default: return '#00FF88'
    }
  }

  const getSensorSize = (sensor: SensorData) => {
    if (sensor.anomalyDetected) return 0.8
    return sensor.status === 'critical' ? 0.6 : 0.4
  }

  const getCableColor = (cable: CableRoute) => {
    switch (cable.status) {
      case 'operational': return '#00AAFF'
      case 'maintenance': return '#FFB800'
      case 'fault': return '#FF4444'
      default: return '#00AAFF'
    }
  }

  const handleSensorClick = useCallback((sensor: SensorData) => {
    setSelectedSensor(sensor)
    onSensorClick?.(sensor)
    
    // Focus camera on sensor
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: sensor.lat,
        lng: sensor.lng,
        altitude: 2
      }, 1000)
    }
  }, [onSensorClick])

  const handleSensorHover = useCallback((sensor: SensorData | null) => {
    setHoveredSensor(sensor)
  }, [])

  const resetView = () => {
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
      }, 1000)
    }
    setSelectedSensor(null)
  }

  // Initialize globe
  useEffect(() => {
    if (globeRef.current && !globeReady) {
      const globe = globeRef.current
      
      // Set initial view
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 })
      
      // Configure globe
      globe.globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      globe.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      globe.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      
      setGlobeReady(true)
    }
  }, [globeReady])

  // Auto rotation
  useEffect(() => {
    if (globeRef.current && autoRotate && !selectedSensor) {
      const globe = globeRef.current
      const controls = globe.controls()
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.5
    }
  }, [autoRotate, selectedSensor])

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature': return '🌡️'
      case 'pressure': return '💧'
      case 'vibration': return '📳'
      case 'electrical': return '⚡'
      default: return '📍'
    }
  }

  const filteredSensors = viewMode === 'cables' ? [] : allSensors
  const filteredCables = viewMode === 'sensors' ? [] : allCables

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[600px] bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md rounded-lg px-3 py-2 border border-slate-700/50">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">🌍 Global Sensor Network</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md rounded-lg px-3 py-2 border border-slate-700/50">
            <Waves className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm">{allSensors.length} Sensors</span>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="both">Sensors & Cables</option>
            <option value="sensors">Sensors Only</option>
            <option value="cables">Cables Only</option>
          </select>
          
          <button
            onClick={resetView}
            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 rounded-lg p-2 text-white transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Globe */}
      <div className="w-full h-full">
        <Globe
          ref={globeRef}
          // Points data (sensors)
          pointsData={filteredSensors}
          pointLat={d => (d as SensorData).lat}
          pointLng={d => (d as SensorData).lng}
          pointColor={d => getSensorColor(d as SensorData)}
          pointRadius={d => getSensorSize(d as SensorData)}
          pointResolution={12}
          pointsMerge={false}
          onPointClick={handleSensorClick}
          onPointHover={handleSensorHover}
          pointLabel={d => {
            const sensor = d as SensorData
            return `
              <div style="background: rgba(0,0,0,0.8); padding: 12px; border-radius: 8px; color: white; font-family: monospace;">
                <div style="font-weight: bold; margin-bottom: 8px;">${getSensorIcon(sensor.sensorType)} ${sensor.id}</div>
                <div>📍 ${sensor.lat.toFixed(4)}°, ${sensor.lng.toFixed(4)}°</div>
                <div>🏔️ Depth: ${sensor.depth}m</div>
                <div>📊 ${sensor.sensorType}: ${sensor.value}${sensor.sensorType === 'temperature' ? '°C' : sensor.sensorType === 'pressure' ? ' bar' : ''}</div>
                <div>🔘 Status: ${sensor.status}</div>
                <div>🔌 Cable: ${sensor.cableName}</div>
                ${sensor.anomalyDetected ? '<div style="color: #FF4444;">⚠️ Anomaly Detected</div>' : ''}
              </div>
            `
          }}
          
          // Paths data (cables)
          pathsData={showCables ? filteredCables : []}
          pathPoints={d => (d as CableRoute).coordinates}
          pathPointLat={d => d[1]}
          pathPointLng={d => d[0]}
          pathColor={d => getCableColor(d as CableRoute)}
          pathStroke={3}
          pathResolution={2}
          pathLabel={d => {
            const cable = d as CableRoute
            return `
              <div style="background: rgba(0,0,0,0.8); padding: 12px; border-radius: 8px; color: white; font-family: monospace;">
                <div style="font-weight: bold; margin-bottom: 8px;">🔌 ${cable.name}</div>
                <div>🔘 Status: ${cable.status}</div>
                <div>📍 Sensors: ${cable.sensors.length}</div>
                <div>📏 Route Length: ~${Math.round(cable.coordinates.length * 2000)}km</div>
              </div>
            `
          }}

          // Globe configuration
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // Animation
          animateIn={true}
          waitForGlobeReady={true}
          
          // Controls
          enablePointerInteraction={true}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-md rounded-lg p-4 border border-slate-700/50 max-w-xs">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Sensor Status
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-slate-300">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-slate-300">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-slate-300">Critical/Anomaly</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-slate-300">Offline</span>
          </div>
        </div>
      </div>

      {/* Sensor Details Panel */}
      {selectedSensor && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-4 right-4 w-80 bg-slate-800/95 backdrop-blur-md rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              {getSensorIcon(selectedSensor.sensorType)} {selectedSensor.id}
            </h3>
            <button
              onClick={() => setSelectedSensor(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400">Latitude:</span>
                <div className="text-white font-mono">{selectedSensor.lat.toFixed(6)}°</div>
              </div>
              <div>
                <span className="text-slate-400">Longitude:</span>
                <div className="text-white font-mono">{selectedSensor.lng.toFixed(6)}°</div>
              </div>
            </div>
            
            <div>
              <span className="text-slate-400">Depth:</span>
              <div className="text-white font-mono">{selectedSensor.depth}m below sea level</div>
            </div>
            
            <div>
              <span className="text-slate-400">Current Reading:</span>
              <div className="text-white font-mono">
                {selectedSensor.value}{selectedSensor.sensorType === 'temperature' ? '°C' : 
                selectedSensor.sensorType === 'pressure' ? ' bar' : 
                selectedSensor.sensorType === 'vibration' ? ' Hz' : ' V'}
              </div>
            </div>
            
            <div>
              <span className="text-slate-400">Status:</span>
              <div className={`font-medium ${
                selectedSensor.status === 'active' ? 'text-green-400' :
                selectedSensor.status === 'warning' ? 'text-yellow-400' :
                selectedSensor.status === 'critical' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {selectedSensor.status.toUpperCase()}
              </div>
            </div>
            
            <div>
              <span className="text-slate-400">Cable:</span>
              <div className="text-white">{selectedSensor.cableName}</div>
            </div>
            
            {selectedSensor.anomalyDetected && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Anomaly Detected</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Stats Panel */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-md rounded-lg p-3 border border-slate-700/50">
        <div className="text-xs text-slate-400 space-y-1">
          <div>🟢 Active: {allSensors.filter(s => s.status === 'active').length}</div>
          <div>🟡 Warning: {allSensors.filter(s => s.status === 'warning').length}</div>
          <div>🔴 Critical: {allSensors.filter(s => s.status === 'critical').length}</div>
          <div>⚫ Offline: {allSensors.filter(s => s.status === 'offline').length}</div>
          <div>⚠️ Anomalies: {allSensors.filter(s => s.anomalyDetected).length}</div>
        </div>
      </div>
    </motion.div>
  )
} 
 