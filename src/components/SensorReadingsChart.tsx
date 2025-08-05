'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { format } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface SensorReadingsChartProps {
  data: Array<{
    timestamp: Date
    sensor_id: string
    value: number
    is_anomaly_detected: boolean
  }>
}

export default function SensorReadingsChart({ data }: SensorReadingsChartProps) {
  const processChartData = () => {
    const sensorIds = ['sensor_0_0', 'sensor_1_1', 'sensor_2_2']
    const colors = [
      { normal: 'rgba(59, 130, 246, 0.8)', anomaly: 'rgba(239, 68, 68, 1)' },
      { normal: 'rgba(139, 92, 246, 0.8)', anomaly: 'rgba(239, 68, 68, 1)' },
      { normal: 'rgba(34, 197, 94, 0.8)', anomaly: 'rgba(239, 68, 68, 1)' }
    ]

    const datasets = sensorIds.map((sensorId, index) => {
      const sensorData = data
        .filter(d => d.sensor_id === sensorId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(-20) // Last 20 points

      return {
        label: sensorId.replace('sensor_', 'Sensor '),
        data: sensorData.map(d => d.value),
        borderColor: colors[index].normal,
        backgroundColor: colors[index].normal.replace('0.8', '0.1'),
        pointBackgroundColor: sensorData.map(d => 
          d.is_anomaly_detected ? colors[index].anomaly : colors[index].normal
        ),
        pointRadius: sensorData.map(d => d.is_anomaly_detected ? 6 : 3),
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true
      }
    })

    const labels = data
      .filter(d => d.sensor_id === sensorIds[0])
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-20)
      .map(d => format(d.timestamp, 'HH:mm:ss'))

    return { datasets, labels }
  }

  const chartData = processChartData()

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
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
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📊 Real-Time Sensor Readings
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        </h3>
        <div className="text-sm text-slate-400">
          Live updates every 2 seconds
        </div>
      </div>
      
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-400">Normal Reading</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-400">Anomaly Detected</span>
            </div>
          </div>
          <div className="text-slate-400">
            Last updated: {format(new Date(), 'HH:mm:ss')}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 