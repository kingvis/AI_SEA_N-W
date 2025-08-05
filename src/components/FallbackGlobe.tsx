'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface SensorPoint {
  id: string
  lat: number
  lng: number
  status: 'active' | 'warning' | 'critical' | 'offline'
  name: string
}

export default function FallbackGlobe() {
  const [selectedSensor, setSelectedSensor] = useState<SensorPoint | null>(null)

  // Sample sensor data
  const sensors: SensorPoint[] = [
    { id: 'NYC', lat: 40.7589, lng: -73.9876, status: 'active', name: 'New York' },
    { id: 'LON', lat: 51.5074, lng: -0.1278, status: 'warning', name: 'London' },
    { id: 'TOK', lat: 35.6762, lng: 139.6503, status: 'active', name: 'Tokyo' },
    { id: 'SYD', lat: -33.8688, lng: 151.2093, status: 'critical', name: 'Sydney' },
    { id: 'NYC2', lat: 25.7617, lng: -80.1918, status: 'active', name: 'Miami' },
  ]

  // Convert lat/lng to SVG coordinates
  const latLngToXY = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width
    const y = ((90 - lat) / 180) * height
    return { x, y }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981'
      case 'warning': return '#F59E0B'
      case 'critical': return '#EF4444'
      case 'offline': return '#6B7280'
      default: return '#10B981'
    }
  }

  const svgWidth = 800
  const svgHeight = 400

  return (
    <div className="w-full bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          🌍 Global Sensor Network (2D View)
        </h3>
        <p className="text-slate-400 text-sm">Interactive world map with sensor locations</p>
      </div>

      <div className="relative bg-slate-900 rounded-lg overflow-hidden">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-96 bg-gradient-to-b from-blue-900 to-blue-800"
        >
          {/* World map outline (simplified) */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
            </pattern>
          </defs>
          
          <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />
          
          {/* Continents (simplified shapes) */}
          <g fill="#1e293b" stroke="#334155" strokeWidth="1">
            {/* North America */}
            <path d="M 100 80 L 200 70 L 250 120 L 180 180 L 120 160 Z" />
            {/* South America */}
            <path d="M 180 200 L 220 190 L 210 280 L 190 290 L 170 250 Z" />
            {/* Europe */}
            <path d="M 380 80 L 450 70 L 460 120 L 420 140 L 370 110 Z" />
            {/* Africa */}
            <path d="M 420 140 L 480 130 L 490 250 L 450 280 L 410 220 Z" />
            {/* Asia */}
            <path d="M 450 70 L 650 60 L 680 140 L 620 180 L 460 120 Z" />
            {/* Australia */}
            <path d="M 620 250 L 680 240 L 690 280 L 640 290 L 610 270 Z" />
          </g>

          {/* Connection lines between sensors */}
          <g stroke="#3B82F6" strokeWidth="1" strokeDasharray="2,2" opacity="0.6">
            {sensors.slice(0, -1).map((sensor, index) => {
              const currentPos = latLngToXY(sensor.lat, sensor.lng, svgWidth, svgHeight)
              const nextSensor = sensors[index + 1]
              const nextPos = latLngToXY(nextSensor.lat, nextSensor.lng, svgWidth, svgHeight)
              
              return (
                <line
                  key={`line-${sensor.id}-${nextSensor.id}`}
                  x1={currentPos.x}
                  y1={currentPos.y}
                  x2={nextPos.x}
                  y2={nextPos.y}
                />
              )
            })}
          </g>

          {/* Sensor points */}
          {sensors.map((sensor) => {
            const { x, y } = latLngToXY(sensor.lat, sensor.lng, svgWidth, svgHeight)
            const isSelected = selectedSensor?.id === sensor.id
            
            return (
              <g key={sensor.id}>
                {/* Pulse animation for selected sensor */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill={getStatusColor(sensor.status)}
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values="10;20;10"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                
                {/* Main sensor point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "8" : "6"}
                  fill={getStatusColor(sensor.status)}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-8 transition-all"
                  onClick={() => setSelectedSensor(sensor)}
                />
                
                {/* Sensor label */}
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  className="fill-white text-xs font-medium pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {sensor.id}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Selected sensor info */}
        {selectedSensor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-md rounded-lg p-4 border border-slate-700 min-w-48"
          >
            <h4 className="text-white font-semibold mb-2">{selectedSensor.name}</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">ID:</span>
                <span className="text-white">{selectedSensor.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span 
                  className="font-medium"
                  style={{ color: getStatusColor(selectedSensor.status) }}
                >
                  {selectedSensor.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lat:</span>
                <span className="text-white font-mono">{selectedSensor.lat.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lng:</span>
                <span className="text-white font-mono">{selectedSensor.lng.toFixed(4)}°</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedSensor(null)}
              className="absolute top-2 right-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-300">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-slate-300">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-300">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-slate-300">Offline</span>
          </div>
        </div>
        
        <div className="text-slate-400 text-sm">
          Click sensors for details • {sensors.length} total sensors
        </div>
      </div>
    </div>
  )
} 
 