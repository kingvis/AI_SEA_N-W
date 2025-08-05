'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Wrench, 
  BarChart3,
  Clock,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react'

interface PredictiveAnalyticsProps {
  networkStats: any
  className?: string
}

interface MaintenanceItem {
  sensor: string
  location: string
  predictedDate: Date
  confidence: number
  type: string
  reason: string
  priority: string
}

interface FailurePrediction {
  component: string
  probability: number
  timeframe: string
  impact: string
  preventiveAction: string
}

interface CapacityForecast {
  currentUtilization: number
  projectedGrowth: number
  capacityLimit: number
  timeToLimit: string
  recommendedAction: string
}

interface RiskAssessment {
  overall: string
  technicalRisk: number
  businessRisk: number
  environmentalRisk: number
  securityRisk: number
}

export default function PredictiveAnalytics({ networkStats, className = '' }: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<{
    maintenanceSchedule: MaintenanceItem[]
    failurePredictions: FailurePrediction[]
    capacityForecast: CapacityForecast
    riskAssessment: RiskAssessment
  }>({
    maintenanceSchedule: [],
    failurePredictions: [],
    capacityForecast: {
      currentUtilization: 0,
      projectedGrowth: 0,
      capacityLimit: 0,
      timeToLimit: '',
      recommendedAction: ''
    },
    riskAssessment: {
      overall: 'Low',
      technicalRisk: 0,
      businessRisk: 0,
      environmentalRisk: 0,
      securityRisk: 0
    }
  })

  useEffect(() => {
    // Simulate AI predictions based on current system state
    const anomalyRate = networkStats.anomaly_rate || 0
    const availability = networkStats.active_sensors / Math.max(networkStats.totalSensors, 1)
    
    // Generate maintenance predictions
    const maintenanceSchedule = [
      {
        sensor: 'sensor_0_0',
        location: 'Deep Abyssal Pacific',
        predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        confidence: 87,
        type: 'Preventive',
        reason: 'Temperature sensor drift detected',
        priority: 'Medium'
      },
      {
        sensor: 'sensor_2_2',
        location: 'Mid-Atlantic Ridge',
        predictedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        confidence: 93,
        type: 'Predictive',
        reason: 'Pressure sensor degradation pattern',
        priority: 'High'
      },
      {
        sensor: 'sensor_1_1',
        location: 'Continental Slope Atlantic',
        predictedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        confidence: 76,
        type: 'Condition-based',
        reason: 'Vibration pattern analysis',
        priority: 'Low'
      }
    ]

    // Generate failure predictions
    const failurePredictions = [
      {
        component: 'Optical Amplifier Unit 3',
        probability: Math.min(95, 15 + (anomalyRate * 200)),
        timeframe: '2-3 weeks',
        impact: 'High',
        preventiveAction: 'Replace optical components during next maintenance window'
      },
      {
        component: 'Power Feeding Equipment',
        probability: Math.min(90, 8 + (anomalyRate * 150)),
        timeframe: '1-2 months',
        impact: 'Critical',
        preventiveAction: 'Schedule redundant power supply installation'
      }
    ]

    // Capacity and risk assessments
    const capacityForecast = {
      currentUtilization: Math.round(65 + (availability * 25)),
      projectedGrowth: 12.5,
      capacityLimit: 85,
      timeToLimit: '8.3 months',
      recommendedAction: 'Plan capacity expansion by Q3 2024'
    }

    const riskAssessment = {
      overall: anomalyRate < 0.05 ? 'Low' : anomalyRate < 0.1 ? 'Medium' : 'High',
      technicalRisk: Math.round(10 + (anomalyRate * 60)),
      businessRisk: Math.round(5 + (anomalyRate * 40)),
      environmentalRisk: Math.round(15 + Math.random() * 20),
      securityRisk: Math.round(8 + Math.random() * 15)
    }

    setPredictions({
      maintenanceSchedule,
      failurePredictions,
      capacityForecast,
      riskAssessment
    })
  }, [networkStats])

  const getRiskColor = (level: string | undefined) => {
    if (!level) return 'text-slate-400'
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Predictive Analytics</h3>
          <p className="text-slate-400 text-sm">Machine learning insights & forecasting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Schedule Prediction */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Predicted Maintenance Schedule</h4>
          </div>
          
          <div className="space-y-3">
            {predictions.maintenanceSchedule.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.sensor}</p>
                    <p className="text-xs text-slate-400">{item.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    {item.predictedDate.toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-blue-400 font-medium">{item.confidence}%</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Failure Predictions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-semibold text-white">Failure Risk Analysis</h4>
          </div>
          
          <div className="space-y-3">
            {predictions.failurePredictions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.component}</p>
                    <p className="text-xs text-slate-400">Impact: {item.impact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{item.probability}%</p>
                    <p className="text-xs text-slate-400">{item.timeframe}</p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-1.5 mb-2">
                  <div 
                    className="bg-red-400 h-1.5 rounded-full"
                    style={{ width: `${item.probability}%` }}
                  />
                </div>
                
                <p className="text-xs text-slate-500">{item.preventiveAction}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Capacity Forecast */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-semibold text-white">Capacity Planning</h4>
          </div>
          
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400">Current Utilization</p>
                <p className="text-lg font-bold text-green-400">{predictions.capacityForecast.currentUtilization}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Projected Growth</p>
                <p className="text-lg font-bold text-blue-400">+{predictions.capacityForecast.projectedGrowth}%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Capacity Utilization</span>
                <span className="text-slate-300">{predictions.capacityForecast.currentUtilization}% / {predictions.capacityForecast.capacityLimit}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full"
                  style={{ width: `${(predictions.capacityForecast.currentUtilization / predictions.capacityForecast.capacityLimit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Time to capacity limit: {predictions.capacityForecast.timeToLimit}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Risk Assessment Matrix</h4>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Overall Risk Level</span>
                <span className={`text-sm font-bold ${getRiskColor(predictions.riskAssessment.overall)}`}>
                  {predictions.riskAssessment.overall}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Technical:</span>
                  <span className="text-slate-300">{predictions.riskAssessment.technicalRisk}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Business:</span>
                  <span className="text-slate-300">{predictions.riskAssessment.businessRisk}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Environmental:</span>
                  <span className="text-slate-300">{predictions.riskAssessment.environmentalRisk}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security:</span>
                  <span className="text-slate-300">{predictions.riskAssessment.securityRisk}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-semibold text-white">AI Recommendations</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-300">Optimize Maintenance Windows</p>
              <p className="text-xs text-blue-400/80">Schedule maintenance during low-traffic periods to minimize impact</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
          >
            <Wrench className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-300">Proactive Component Replacement</p>
              <p className="text-xs text-purple-400/80">Replace aging components before failure probability exceeds 80%</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 
 