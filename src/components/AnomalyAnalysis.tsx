'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Anomaly {
  timestamp: Date
  sensor_id: string
  consecutive_count: number
}

interface AnomalyAnalysisProps {
  anomalies: Anomaly[]
}

export default function AnomalyAnalysis({ anomalies }: AnomalyAnalysisProps) {
  const processAnomalyData = () => {
    const sensorCounts: { [key: string]: number } = {}
    const severityCounts = { low: 0, medium: 0, high: 0 }
    
    anomalies.forEach(anomaly => {
      const sensorId = anomaly.sensor_id
      sensorCounts[sensorId] = (sensorCounts[sensorId] || 0) + 1
      
      // Categorize by consecutive count
      if (anomaly.consecutive_count >= 3) {
        severityCounts.high++
      } else if (anomaly.consecutive_count >= 2) {
        severityCounts.medium++
      } else {
        severityCounts.low++
      }
    })
    
    return { sensorCounts, severityCounts }
  }

  const { sensorCounts, severityCounts } = processAnomalyData()
  
  const chartData = {
    labels: Object.keys(sensorCounts).map(id => id.replace('sensor_', 'Sensor ')),
    datasets: [
      {
        label: 'Anomaly Count',
        data: Object.values(sensorCounts),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(252, 165, 165, 0.8)',
          'rgba(254, 202, 202, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(252, 165, 165, 1)',
          'rgba(254, 202, 202, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          }
        },
        beginAtZero: true
      }
    }
  }

  const totalAnomalies = anomalies.length
  const avgPerSensor = Object.keys(sensorCounts).length > 0 ? 
    totalAnomalies / Object.keys(sensorCounts).length : 0
  const mostActiveSensor = Object.keys(sensorCounts).reduce((a, b) => 
    sensorCounts[a] > sensorCounts[b] ? a : b, Object.keys(sensorCounts)[0] || 'None')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          ⚠️ Anomaly Analysis
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <TrendingUp className="w-4 h-4" />
          <span>Live Analysis</span>
        </div>
      </div>

      {totalAnomalies === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
          >
            <Target className="w-8 h-8 text-green-400" />
          </motion.div>
          <p className="text-slate-400 text-center">
            ✅ No Anomalies Detected<br />
            <span className="text-sm text-slate-500">All sensors operating within normal parameters</span>
          </p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-64 mb-6">
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">Total</span>
              </div>
              <motion.div
                key={totalAnomalies}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-red-400"
              >
                {totalAnomalies}
              </motion.div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">Average</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {avgPerSensor.toFixed(1)}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-medium">High Risk</span>
              </div>
              <motion.div
                key={severityCounts.high}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-yellow-400"
              >
                {severityCounts.high}
              </motion.div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">Most Active</span>
              </div>
              <div className="text-xs font-mono text-purple-400 font-bold">
                {mostActiveSensor?.replace('sensor_', 'S') || 'None'}
              </div>
            </motion.div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              📈 Analysis Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">• Total Anomalies:</span>
                <span className="text-white ml-2 font-medium">{totalAnomalies}</span>
              </div>
              <div>
                <span className="text-slate-400">• High Severity:</span>
                <span className="text-red-400 ml-2 font-medium">{severityCounts.high}</span>
              </div>
              <div>
                <span className="text-slate-400">• Medium Severity:</span>
                <span className="text-yellow-400 ml-2 font-medium">{severityCounts.medium}</span>
              </div>
              <div>
                <span className="text-slate-400">• Low Severity:</span>
                <span className="text-blue-400 ml-2 font-medium">{severityCounts.low}</span>
              </div>
              <div>
                <span className="text-slate-400">• Most Active Sensor:</span>
                <span className="text-purple-400 ml-2 font-medium font-mono">
                  {mostActiveSensor?.replace('sensor_', 'Sensor ') || 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">• Average per Sensor:</span>
                <span className="text-cyan-400 ml-2 font-medium">{avgPerSensor.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
} 