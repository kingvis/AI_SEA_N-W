'use client'

import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
    <div className="text-white">Loading 3D Globe...</div>
  </div>
})

interface SimpleGlobeProps {
  height?: number
}

export default function SimpleGlobe({ height = 400 }: SimpleGlobeProps) {
  const globeRef = useRef<any>()

  // Sample data for testing
  const sampleData = [
    { lat: 40.7589, lng: -73.9876, name: 'New York' },
    { lat: 51.5074, lng: -0.1278, name: 'London' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
  ]

  useEffect(() => {
    if (globeRef.current) {
      // Configure globe
      const globe = globeRef.current
      globe.pointOfView({ lat: 0, lng: 0, altitude: 2 })
    }
  }, [])

  return (
    <div className="w-full bg-slate-800 rounded-lg border border-slate-700" style={{ height }}>
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-white font-semibold">🌍 3D Globe Test</h3>
        <p className="text-slate-400 text-sm">Testing 3D Globe rendering...</p>
      </div>
      
      <div className="relative" style={{ height: height - 80 }}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          pointsData={sampleData}
          pointLat={d => (d as any).lat}
          pointLng={d => (d as any).lng}
          pointColor={() => '#ff6b6b'}
          pointRadius={0.5}
          pointLabel={d => `<b>${(d as any).name}</b>`}
          
          enablePointerInteraction={true}
          animateIn={true}
        />
      </div>
    </div>
  )
} 
 