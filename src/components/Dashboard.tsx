'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Download, Settings, CheckCircle, AlertTriangle, X, Bell } from 'lucide-react'
import Header from './Header'
import StatsCards from './StatsCards'
import SensorReadingsChart from './SensorReadingsChart'
import NetworkStatusChart from './NetworkStatusChart'
import SensorHealthMatrix from './SensorHealthMatrix'
import AlertsTimeline from './AlertsTimeline'
import AnomalyAnalysis from './AnomalyAnalysis'
import SystemStatistics from './SystemStatistics'
import BusinessMetrics from './BusinessMetrics'
import PredictiveAnalytics from './PredictiveAnalytics'
import ComplianceReporting from './ComplianceReporting'

// Consistent color theme
export const THEME_COLORS = {
  sensors: {
    'sensor_0_0': { primary: '#3B82F6', secondary: '#1E40AF', name: 'Temperature', icon: '🌡️' },
    'sensor_1_1': { primary: '#10B981', secondary: '#047857', name: 'Pressure', icon: '📊' },
    'sensor_2_2': { primary: '#F59E0B', secondary: '#D97706', name: 'Vibration', icon: '📳' },
    'sensor_3_3': { primary: '#8B5CF6', secondary: '#6D28D9', name: 'Current', icon: '⚡' },
    'sensor_4_4': { primary: '#EF4444', secondary: '#DC2626', name: 'Voltage', icon: '🔋' }
  },
  status: {
    excellent: { bg: '#10B981', light: '#34D399', dark: '#047857' },
    good: { bg: '#3B82F6', light: '#60A5FA', dark: '#1E40AF' },
    warning: { bg: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
    critical: { bg: '#EF4444', light: '#F87171', dark: '#DC2626' }
  },
  anomaly: '#EF4444',
  normal: '#10B981'
}

interface SensorReading {
  id?: string
  timestamp: Date
  sensor_id: string
  value: number
  is_anomaly_detected: boolean
  sensor_type: string
  location: string
  depth: string
  pressure: number
  salinity: number
}

interface NetworkStats {
  activeSensors: number
  totalSensors: number
  timeoutSensors: number
  total_readings: number
  anomalies_detected: number
  alerts_raised: number
  anomaly_rate: number
  uptime_seconds: number
}

interface Alert {
  id: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
  sensor_id: string
  description: string
  resolved: boolean
}

interface SystemHealth {
  overall: 'excellent' | 'good' | 'warning' | 'critical'
  metrics: {
    availability: number
    performance: number
    security: number
  }
}

interface DashboardData {
  sensorReadings: SensorReading[]
  networkStats: NetworkStats
  alerts: Alert[]
  anomalies: SensorReading[]
  systemHealth: SystemHealth
}

function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    sensorReadings: [],
    networkStats: {
      totalSensors: 0,
      activeSensors: 0,
      timeoutSensors: 0,
      total_readings: 0,
      anomalies_detected: 0,
      alerts_raised: 0,
      anomaly_rate: 0,
      uptime_seconds: 0
    },
    alerts: [],
    anomalies: [],
    systemHealth: {
      overall: 'good',
      metrics: {
        availability: 95,
        performance: 90,
        security: 98
      }
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [showAnomalyModal, setShowAnomalyModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null)
  const [startTime] = useState(() => Date.now())
  const [scrollY, setScrollY] = useState(0)
  const [showAnimations, setShowAnimations] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date())
  const [acknowledgedAnomalies, setAcknowledgedAnomalies] = useState<Set<string>>(new Set())
  const [currentUptime, setCurrentUptime] = useState(() => (Date.now() - startTime) / 1000)
  const [cumulativeReadings, setCumulativeReadings] = useState(0)
  const [totalAnomaliesEver, setTotalAnomaliesEver] = useState(0)
  const [lastAnomalyTime, setLastAnomalyTime] = useState(Date.now())
  const [anomalyPatterns, setAnomalyPatterns] = useState<{[key: string]: number}>({})
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.6)
  const [lastSoundTime, setLastSoundTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // System status for header
  const [systemStatus, setSystemStatus] = useState({
    monitoring: true,
    network: 'online' as 'online' | 'offline' | 'degraded',
    aiProtection: 'active' as 'active' | 'inactive' | 'scanning'
  })

  // Handle anomaly acknowledgment
  const handleAcknowledgeAnomaly = useCallback((anomalyId: string) => {
    setAcknowledgedAnomalies(prev => new Set([...prev, anomalyId]))
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
    
    // Log acknowledgment
    console.log(`Anomaly acknowledged: ${anomalyId}`)
    
    // In a real application, this would make an API call
    // updateAnomalyStatus(anomalyId, 'acknowledged')
  }, [])

  // Handle anomaly escalation
  const handleEscalateAnomaly = useCallback((anomaly: any) => {
    console.log('Escalating anomaly:', anomaly)
    
    // Create escalation report
    const escalationData = {
      anomaly_id: anomaly.id || Date.now().toString(),
      timestamp: new Date().toISOString(),
      sensor_id: anomaly.sensor_id,
      severity: 'high',
      description: anomaly.description || 'Anomaly requires immediate attention',
      escalated_by: 'dashboard_user',
      network_stats: data.networkStats
    }
    
    // In a real application, this would trigger an alert system
    alert(`Anomaly escalated to operations team.\n\nAnomaly ID: ${escalationData.anomaly_id}\nSensor: ${escalationData.sensor_id}\n\nThe operations team has been notified and will respond within 15 minutes.`)
    
    setShowAnomalyModal(false)
  }, [data.networkStats])

  // Handle anomaly card click from StatsCards
  const handleAnomalyCardClick = useCallback(() => {
    if (data.anomalies.length > 0) {
      const latestAnomaly = data.anomalies[data.anomalies.length - 1]
      setSelectedAnomaly({
        ...latestAnomaly,
        id: latestAnomaly.id || Date.now().toString(),
        description: `Anomaly detected in sensor ${latestAnomaly.sensor_id}. Value: ${latestAnomaly.value?.toFixed(2)} at ${new Date(latestAnomaly.timestamp).toLocaleString()}`
      })
      setShowAnomalyModal(true)
    } else {
      console.log('No anomalies to display')
    }
  }, [data.anomalies])

  // Handle scroll events for animations
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      
      // Show animations after scrolling 200px
      if (currentScrollY > 200 && !showAnimations) {
        setShowAnimations(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAnimations])

  // Refresh data functionality
  const handleRefreshData = useCallback(() => {
    setIsLoading(true)
    setLastRefreshTime(new Date())
    
    // Simulate data refresh
    setTimeout(() => {
      // Generate fresh mock data
      const freshData = generateMockData()
      setData(freshData)
      setIsLoading(false)
      
      // Show notification
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }, 1000)
  }, [])

  // Export functionality
  const handleExportData = useCallback(async () => {
    setIsExporting(true)
    
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        dashboard_data: data,
        system_status: systemStatus,
        metadata: {
          sensors_count: data.networkStats.activeSensors,
          alerts_count: data.alerts.length,
          anomalies_count: data.anomalies.length,
          export_version: '2.1.4'
        }
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cableguard-dashboard-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Show success notification
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [data, systemStatus])

  // Settings functionality
  const handleShowSettings = useCallback(() => {
    setShowSettingsModal(true)
  }, [])

  // Notifications functionality
  const handleShowNotifications = useCallback(() => {
    setShowNotificationsModal(true)
  }, [])

  // Enhanced alert sound system
  const playAlertSound = useCallback((severity: 'low' | 'medium' | 'high' = 'medium', anomalyCount: number = 1) => {
    if (!soundEnabled) return
    
    // Prevent sound spam - minimum 2 seconds between sounds
    const now = Date.now()
    if (now - lastSoundTime < 2000) return
    setLastSoundTime(now)
    
    try {
      // Create Web Audio API context for custom sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Different sound patterns for different severities
      const soundPatterns = {
        low: {
          frequency: 800,
          duration: 0.3,
          pattern: [1]
        },
        medium: {
          frequency: 1000,
          duration: 0.4,
          pattern: [1, 0.3, 1]
        },
        high: {
          frequency: 1200,
          duration: 0.5,
          pattern: [1, 0.2, 1, 0.2, 1]
        }
      }
      
      const pattern = soundPatterns[severity]
      let delay = 0
      
      pattern.pattern.forEach((volume, index) => {
        setTimeout(() => {
          if (volume > 0) {
            // Create oscillator for beep sound
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            // Configure sound
            oscillator.frequency.setValueAtTime(pattern.frequency, audioContext.currentTime)
            oscillator.type = severity === 'high' ? 'square' : 'sine'
            
            // Volume envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            gainNode.gain.linearRampToValueAtTime(soundVolume * volume, audioContext.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + pattern.duration)
            
            // Play sound
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + pattern.duration)
            
            console.log(`🔊 Playing ${severity} severity alert sound`)
          }
        }, delay)
        delay += pattern.duration * 1000 + 100 // Small gap between beeps
      })
      
    } catch (error) {
      console.warn('Could not play alert sound:', error)
      // Fallback to simple beep
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
    }
  }, [soundEnabled, soundVolume, lastSoundTime])

  // Legacy support - keep the old function name but use new system
  const playAlarmSound = useCallback(() => {
    playAlertSound('medium', 1)
  }, [playAlertSound])

  // Generate synchronized mock data function
  const generateMockData = useCallback((): DashboardData => {
    console.log('📊 Generating synchronized sensor data...')
    const totalSensorCount = 5
    const currentTime = Date.now()
    
    // Enhanced anomaly detection with dynamic patterns
    const sensorReadings = Array.from({ length: totalSensorCount }, (_, i) => {
      const sensorType = ['temperature', 'pressure', 'vibration', 'current', 'voltage'][i]
      const sensorId = `sensor_${i}_${i}`
      const baseValues = { temperature: 15, pressure: 75, vibration: 2, current: 12, voltage: 240 }
      const baseValue = baseValues[sensorType as keyof typeof baseValues]
      
      // Enhanced realistic anomaly detection with operational patterns
      let isAnomaly = false
      let anomalyIntensity = 0
      
      // Current time context for realistic patterns
      const currentHour = new Date().getHours()
      const currentMinute = new Date().getMinutes()
      const timeSinceLastAnomaly = currentTime - lastAnomalyTime
      
      // Realistic operational cycles (5-minute monitoring cycles)
      const operationalCycle = Math.sin((currentTime / 300000) + i) // 5-minute cycles per sensor
      const dailyPattern = Math.sin(((currentHour - 6) / 12) * Math.PI) // Peak stress 6AM-6PM
      const sensorPattern = anomalyPatterns[sensorId] || Math.random()
      
      // Base anomaly probability (realistic for submarine cable monitoring)
      let anomalyChance = 0.03 // Base 3% chance per check (every 30 seconds)
      
      // 1. Operational stress periods (higher chance during active hours)
      if (currentHour >= 6 && currentHour <= 22) {
        anomalyChance += 0.04 // +4% during operational hours
      }
      
      // 2. Time since last anomaly (realistic maintenance patterns)
      if (timeSinceLastAnomaly > 300000) { // 5+ minutes since last anomaly
        anomalyChance += 0.05 // +5% if quiet for too long
      } else if (timeSinceLastAnomaly < 120000) { // Less than 2 minutes
        anomalyChance += 0.03 // +3% cascade effect
      }
      
      // 3. Sensor aging and environmental patterns
      if (sensorPattern > 0.75) {
        anomalyChance += 0.04 // +4% for problematic sensors
      }
      
      // 4. Environmental stress (deep sea conditions)
      const environmentalStress = Math.abs(operationalCycle) > 0.6 && dailyPattern > 0.2
      if (environmentalStress) {
        anomalyChance += 0.06 // +6% during environmental stress
      }
      
      // 5. Critical threshold events (rare but severe)
      const criticalEvent = Math.random() < 0.005 // 0.5% chance of critical event
      
      // Determine if anomaly occurs
      const standardAnomaly = Math.random() < anomalyChance
      
             if (standardAnomaly || criticalEvent) {
         isAnomaly = true
         // Realistic anomaly intensity based on severity
         if (criticalEvent) {
           anomalyIntensity = 0.8 + Math.random() * 0.15 // 80-95% deviation for critical
           console.log(`🔥 CRITICAL Anomaly detected in ${sensorType} sensor (${sensorId}) at ${new Date().toLocaleTimeString()}`)
         } else {
           anomalyIntensity = 0.25 + Math.random() * 0.45 // 25-70% deviation for standard
           console.log(`🚨 Standard Anomaly detected in ${sensorType} sensor (${sensorId}) at ${new Date().toLocaleTimeString()}`)
         }
       }
      
      // Calculate sensor value with realistic variance patterns
      let value = baseValue
      
      if (isAnomaly) {
        // Clear anomaly peaks for better visualization
        const anomalyDirection = Math.random() > 0.5 ? 1 : -1 // Spike up or down
        const anomalyOffset = baseValue * anomalyIntensity * anomalyDirection
        value = baseValue + anomalyOffset
      } else {
        // Normal operational variance (smaller, more realistic)
        const normalVariance = (Math.random() - 0.5) * baseValue * 0.03 // ±3% normal variance
        value = baseValue + normalVariance
      }
      
             // Ensure values stay within realistic bounds
       const minMax = {
         temperature: [5, 35],
         pressure: [40, 120],
         vibration: [0.5, 8],
         current: [8, 20],
         voltage: [200, 280]
       }
       const [min, max] = minMax[sensorType as keyof typeof minMax]
       const clampedValue = Math.max(min, Math.min(max, value))
       
       // Enhanced logging for anomalies with details
       if (isAnomaly) {
         const deviation = Math.abs(clampedValue - baseValue)
         const deviationPercent = (deviation / baseValue * 100).toFixed(1)
         console.log(`   📊 Final Value: ${clampedValue.toFixed(2)} (Base: ${baseValue}, Deviation: ±${deviation.toFixed(2)} = ${deviationPercent}%)`)
         console.log(`   ⏰ Timing: Hour=${currentHour}, Since Last=${Math.round(timeSinceLastAnomaly / 1000)}s, Chance=${(anomalyChance * 100).toFixed(1)}%`)
       }
      
      return {
        timestamp: new Date(currentTime - (i * 1000) - Math.random() * 30000),
        sensor_id: sensorId,
        value: Math.round(clampedValue * 100) / 100,
        is_anomaly_detected: isAnomaly,
        sensor_type: sensorType,
        location: `Zone ${i + 1}`,
        depth: `${(i + 1) * 1000}m`,
        pressure: Math.round((75 + (Math.random() - 0.5) * 30) * 100) / 100,
        salinity: Math.round((32 + (Math.random() - 0.5) * 4) * 100) / 100
      }
    })

    // Calculate synchronized metrics based on actual sensor data
    const activeSensors = totalSensorCount - Math.floor(Math.random() * 1) // Most sensors active
    const timeoutSensors = totalSensorCount - activeSensors
    const anomaliesDetected = sensorReadings.filter(r => r.is_anomaly_detected)
    const totalAnomaliesCount = anomaliesDetected.length
    
    // Calculate realistic total readings based on uptime and active sensors
    const uptimeHours = currentUptime / 3600 // Convert to hours
    const readingsPerHour = activeSensors * 120 // 120 readings per hour per sensor (every 30 seconds)
    const newReadings = activeSensors * 1 // New readings since last update (every 30 seconds)
    const totalReadings = Math.floor(uptimeHours * readingsPerHour) + newReadings
    
    // Calculate anomaly rate based on actual anomalies
    const anomalyRate = sensorReadings.length > 0 ? totalAnomaliesCount / sensorReadings.length : 0
    
    // Generate detailed alerts based on actual anomalies
    const alertsFromAnomalies = anomaliesDetected.map((anomaly, i) => {
      const baseValues = { temperature: 15, pressure: 75, vibration: 2, current: 12, voltage: 240 }
      const baseValue = baseValues[anomaly.sensor_type as keyof typeof baseValues]
      const deviation = Math.abs(anomaly.value - baseValue)
      const deviationPercent = Math.round((deviation / baseValue) * 100)
      
      // Determine severity based on deviation percentage
                 const severity: 'low' | 'medium' | 'high' = deviationPercent > 40 ? 'high' : deviationPercent > 20 ? 'medium' : 'low'
      
      // Create more descriptive alert messages
      const units = { temperature: '°C', pressure: ' bar', vibration: ' Hz', current: 'A', voltage: 'V' }
      const unit = units[anomaly.sensor_type as keyof typeof units]
      const statusText = anomaly.value > baseValue ? 'HIGH' : 'LOW'
      
      return {
        id: `alert_${anomaly.sensor_id}_${Date.now() + i}`,
        timestamp: new Date(anomaly.timestamp.getTime() + Math.random() * 30000),
        severity,
        sensor_id: anomaly.sensor_id,
        description: `🚨 ${anomaly.sensor_type.toUpperCase()} ${statusText}: ${anomaly.value.toFixed(2)}${unit} (${deviationPercent}% deviation, ${anomaly.location})`,
        resolved: Math.random() < 0.2 // Lower resolution rate for visibility
      }
    })
    
    // Add some additional system alerts
    const systemAlerts = Math.random() < 0.3 ? [{
      id: `alert_system_${Date.now()}`,
      timestamp: new Date(currentTime - Math.random() * 300000),
      severity: 'low' as const,
      sensor_id: 'system',
      description: 'System maintenance scheduled',
      resolved: true
    }] : []
    
    const allAlerts = [...alertsFromAnomalies, ...systemAlerts]

    const networkStats = {
      activeSensors,
      totalSensors: totalSensorCount,
      timeoutSensors,
      total_readings: totalReadings,
      anomalies_detected: totalAnomaliesCount,
      alerts_raised: allAlerts.length,
      anomaly_rate: Math.round(anomalyRate * 10000) / 100, // Percentage with 2 decimal places
      uptime_seconds: 0  // Uptime is handled separately via currentUptime prop
    }

    // Calculate system health based on actual metrics
    const overallHealth = totalAnomaliesCount === 0 ? 'excellent' : 
                         totalAnomaliesCount <= 1 ? 'good' : 'warning'
    
    const availability = activeSensors / totalSensorCount * 100
    const performance = Math.max(60, 100 - (anomalyRate * 200)) // Performance decreases with anomalies
    const security = Math.max(85, 100 - (totalAnomaliesCount * 5)) // Security score based on anomalies

    return {
      sensorReadings,
      networkStats,
      alerts: allAlerts,
      anomalies: anomaliesDetected,
      systemHealth: {
        overall: overallHealth,
        metrics: {
          availability: Math.round(availability * 100) / 100,
          performance: Math.round(performance * 100) / 100,
          security: Math.round(security * 100) / 100
        }
      }
    }
  }, [startTime])

  // Initialize data on mount
  useEffect(() => {
    const initialData = generateMockData()
    setData(initialData)
    setIsLoading(false)
  }, [generateMockData])

  // Auto-refresh sensor readings every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (systemStatus.monitoring) {
        const timestamp = new Date().toLocaleTimeString()
        console.log(`🔄 [${timestamp}] Refreshing sensor readings data every 30 seconds...`)
        const freshData = generateMockData()
        
        // Update cumulative tracking
        setCumulativeReadings(prev => prev + freshData.networkStats.activeSensors)
        setTotalAnomaliesEver(prev => prev + freshData.anomalies.length)
        
        // Update anomaly tracking
        if (freshData.anomalies.length > 0) {
          setLastAnomalyTime(Date.now())
          console.log(`📊 Total anomalies this cycle: ${freshData.anomalies.length}`)
        }
        
        // Randomly update sensor patterns (some sensors become more/less problematic over time)
        if (Math.random() < 0.3) {
          setAnomalyPatterns(prev => {
            const newPatterns = { ...prev }
            const sensorToUpdate = `sensor_${Math.floor(Math.random() * 5)}_${Math.floor(Math.random() * 5)}`
            newPatterns[sensorToUpdate] = Math.random()
            return newPatterns
          })
        }
        
        setData(freshData)
        setLastRefreshTime(new Date())
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [generateMockData, systemStatus.monitoring])

  // Update uptime every second for real-time display (without affecting main data)
  useEffect(() => {
    const uptimeInterval = setInterval(() => {
      const newUptime = (Date.now() - startTime) / 1000
      setCurrentUptime(newUptime)
      // Uncomment below for debugging uptime updates
      // console.log('⏱️ Uptime updated:', Math.floor(newUptime), 'seconds')
    }, 1000)

    return () => clearInterval(uptimeInterval)
  }, [startTime])

  // Handle anomaly detection with smart alert sounds
  useEffect(() => {
    if (data.anomalies.length > 0) {
      const latestAnomaly = data.anomalies[data.anomalies.length - 1]
      setSelectedAnomaly(latestAnomaly)
      
      // Determine severity based on anomaly characteristics
      const baseValues = { temperature: 15, pressure: 75, vibration: 2, current: 12, voltage: 240 }
      const baseValue = baseValues[latestAnomaly.sensor_type as keyof typeof baseValues] || 1
      const deviation = Math.abs(latestAnomaly.value - baseValue)
      const deviationPercent = (deviation / baseValue) * 100
      
      // Determine overall severity based on multiple factors
      let severity: 'low' | 'medium' | 'high' = 'low'
      if (deviationPercent > 40 || data.anomalies.length >= 3) {
        severity = 'high'
      } else if (deviationPercent > 20 || data.anomalies.length >= 2) {
        severity = 'medium'
      }
      
      // Play appropriate alert sound
      playAlertSound(severity, data.anomalies.length)
      
      console.log(`🔊 Anomaly alert: ${severity} severity (${deviationPercent.toFixed(1)}% deviation, ${data.anomalies.length} total anomalies)`)
    }
  }, [data.anomalies, playAlertSound])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Loading CableGuard AI</h2>
          <p className="text-slate-400">Initializing monitoring systems...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Audio element for alerts */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCTuM1O/PbCEELnzB8dlMFB0rKaEzMjRxNyg3jjImNjA9OzsoOT45IjQuNzkyOzY3Nz85LjUrODkzPTo9Nz47IjgrODg0NzArPSUzPzg9LTw9Ljc0Njw4Oz0rPy8xPzo7LjE5OjwuOTMuMzMtOzwwODMrPyM3PTk9LTU2NTQ7LT01OjM1OTYzLzk3LzIyPT83NSo+MTU0Nz4tMjkuPz0wPjYrPj8yODU8PjQ6NDM5PjI6PTsuODg4NzcrNDM6NzI9Nj46PDI6Nzo1MzI4PjY0PTY6NDM5PjI7PDI4Pjk8PDM1PzU1OzQ+NTU5OD48NDM5PjI7PDI4PD8/MD8xNT43Ozc9NDQ6PDw2Nz83OD44NjE7PTk6PzUyNjY3OzM9Nz04NDM5PzoyOz4yNzYzMz81NTU9Njo0Mzk+MjswOT8="></source>
      </audio>

      {/* Scroll progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 z-50"
        style={{ 
          scaleX: scrollY / (document.documentElement.scrollHeight - window.innerHeight) || 0,
          transformOrigin: "0%" 
        }}
      />

      {/* Background Animations - Only Bubbles */}
      <AnimatePresence>
        {showAnimations && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {/* Animated Bubbles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`bubble-${i}`}
                initial={{ 
                  y: "110vh", 
                  x: `${Math.random() * 100}%`,
                  opacity: 0 
                }}
                animate={{ 
                  y: "-10vh",
                  opacity: [0, 0.6, 0.8, 0.6, 0]
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * 8,
                  ease: "linear"
                }}
                className="absolute w-4 h-4 bg-blue-400/30 rounded-full shadow-lg shadow-blue-400/50 backdrop-blur-sm"
                style={{
                  filter: 'blur(1px)',
                  background: `radial-gradient(circle at 30% 30%, rgba(59, 130, 246, ${0.4 + Math.random() * 0.3}), rgba(147, 197, 253, ${0.2 + Math.random() * 0.2}))`
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10">
        <Header 
          onRefreshData={handleRefreshData}
          onShowSettings={handleShowSettings}
          onShowNotifications={handleShowNotifications}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          soundVolume={soundVolume}
          onVolumeChange={setSoundVolume}
          systemStatus={systemStatus}
        />
        
        {/* Dashboard Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">System Dashboard</h2>
              <span className="text-sm text-slate-400">
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                Refresh
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportData}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg border border-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  animate={{ y: isExporting ? [0, -2, 0] : 0 }}
                  transition={{ duration: 0.5, repeat: isExporting ? Infinity : 0 }}
                >
                  <Download className="w-4 h-4" />
                </motion.div>
                {isExporting ? 'Exporting...' : 'Export Data'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowSettings}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 rounded-lg border border-slate-500/30 transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                Settings
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Improved Container with Better Alignment */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <StatsCards 
              networkStats={data.networkStats} 
              currentUptime={currentUptime}
              onAnomalyClick={handleAnomalyCardClick}
            />
          </motion.div>
          
          {/* Main Charts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            <div className="xl:col-span-2">
              <SensorReadingsChart data={data.sensorReadings} />
            </div>
            <div className="xl:col-span-1">
              <NetworkStatusChart networkStats={data.networkStats} />
            </div>
          </motion.div>
          
          {/* Health Matrix & Alerts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Full-width Health Matrix */}
            <SensorHealthMatrix data={data.sensorReadings} />
            
            {/* Alerts Timeline */}
            <AlertsTimeline alerts={data.alerts} />
          </motion.div>
          
          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnomalyAnalysis anomalies={data.anomalies} />
            <SystemStatistics 
              networkStats={data.networkStats} 
              systemHealth={data.systemHealth}
              currentUptime={currentUptime}
            />
            <BusinessMetrics networkStats={data.networkStats} />
          </motion.div>
          
          {/* Predictive & Compliance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <PredictiveAnalytics networkStats={data.networkStats} />
            <ComplianceReporting networkStats={data.networkStats} />
          </motion.div>
          
          {/* Bottom Spacer for Better Scrolling */}
          <div className="h-32"></div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span>CableGuard AI Dashboard Connected</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anomaly Modal */}
      <AnimatePresence>
        {showAnomalyModal && selectedAnomaly && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAnomalyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Anomaly Details
                </h3>
                <button
                  onClick={() => setShowAnomalyModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sensor:</span>
                  <span className="text-white font-medium">{selectedAnomaly.sensor_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span className="text-white">{new Date(selectedAnomaly.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white capitalize">{selectedAnomaly.type?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity:</span>
                  <span className={`font-medium ${
                    selectedAnomaly.severity === 'High' ? 'text-red-400' : 
                    selectedAnomaly.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {selectedAnomaly.severity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-white">{selectedAnomaly.confidence?.toFixed(1)}%</span>
                </div>
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-300 text-sm">{selectedAnomaly.description}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  onClick={() => {
                    if (selectedAnomaly) {
                      handleAcknowledgeAnomaly(selectedAnomaly.id || Date.now().toString())
                    }
                    setShowAnomalyModal(false)
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Acknowledge Alert
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  onClick={() => handleEscalateAnomaly(selectedAnomaly)}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Escalate
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
                  onClick={() => setShowAnomalyModal(false)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Dashboard Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-300">System Monitoring</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Auto Refresh</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSystemStatus(prev => ({ ...prev, monitoring: !prev.monitoring }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        systemStatus.monitoring ? 'bg-green-500' : 'bg-slate-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: systemStatus.monitoring ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Sound Alerts</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="relative w-12 h-6 rounded-full bg-green-500"
                    >
                      <motion.div
                        initial={{ x: 24 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </motion.button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-300">Display Options</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Background Animations</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAnimations(!showAnimations)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        showAnimations ? 'bg-green-500' : 'bg-slate-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: showAnimations ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </motion.button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700/50">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowSettingsModal(false)
                      handleRefreshData()
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Apply Settings
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotificationsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotificationsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  System Notifications
                </h3>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Recent notifications */}
                {[
                  { id: 1, type: 'info', title: 'System Status', message: 'All systems operational', time: '2m ago' },
                  { id: 2, type: 'warning', title: 'Sensor Alert', message: 'Sensor S2_2 showing irregular readings', time: '5m ago' },
                  { id: 3, type: 'success', title: 'Maintenance Complete', message: 'Scheduled maintenance on Cable 3 completed', time: '1h ago' },
                  { id: 4, type: 'info', title: 'Data Export', message: 'Dashboard data exported successfully', time: '2h ago' },
                ].map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: notification.id * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'success' ? 'bg-green-400' :
                      notification.type === 'warning' ? 'bg-yellow-400' :
                      notification.type === 'error' ? 'bg-red-400' :
                      'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                      <span className="text-xs text-slate-500 mt-2 block">{notification.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => console.log('Mark all as read')}
                  className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Mark All as Read
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {scrollY > 400 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 bg-blue-600/90 hover:bg-blue-700/90 text-white p-4 rounded-full shadow-lg backdrop-blur-md border border-blue-500/50 transition-all duration-300"
            title="Scroll to Top"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⬆️
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
