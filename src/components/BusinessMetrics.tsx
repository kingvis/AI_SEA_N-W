'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Target,
  Download,
  Eye,
  Filter,
  Calendar,
  Shield
} from 'lucide-react'

interface BusinessMetricsProps {
  networkStats: {
    active_sensors?: number
    total_readings?: number
    anomalies_detected?: number
    alerts_raised?: number
    uptime_seconds?: number
  }
  className?: string
}

export default function BusinessMetrics({ networkStats, className = '' }: BusinessMetricsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Handle period selection
  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period)
    console.log(`Business metrics period changed to: ${period}`)
  }, [])

  // Handle reports view
  const handleViewAllReports = useCallback(() => {
    setShowReportsModal(true)
  }, [])

  // Handle report generation
  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true)
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const reportData = {
        title: `Business Metrics Report - ${selectedPeriod}`,
        period: selectedPeriod,
        generated: new Date().toISOString(),
        metrics: metricsData,
        network_stats: networkStats
      }
      
      // Create and download report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `business-metrics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Report generation failed:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }, [selectedPeriod, networkStats])

  const periods = [
    { id: 'week', label: 'Week', icon: Calendar },
    { id: 'month', label: 'Month', icon: Calendar },
    { id: 'quarter', label: 'Quarter', icon: Calendar },
    { id: 'year', label: 'Year', icon: Calendar }
  ]

  // Calculate metrics based on network stats
  const baseRevenue = 2450000
  const uptimePercent = networkStats.uptime_seconds ? Math.min(99.8, (networkStats.uptime_seconds / 86400) * 100) : 99.2
  const anomalyImpact = (networkStats.anomalies_detected || 0) * 0.1
  
  const metricsData = {
    revenue: baseRevenue * (selectedPeriod === 'year' ? 12 : selectedPeriod === 'quarter' ? 3 : selectedPeriod === 'week' ? 0.25 : 1),
    revenueGrowth: Math.max(-5, Math.min(15, 8.5 - anomalyImpact)),
    slaCompliance: Math.max(95, uptimePercent - anomalyImpact),
    revenueAtRisk: Math.max(0, (networkStats.anomalies_detected || 0) * 12000 + (networkStats.alerts_raised || 0) * 8000),
    costSavings: 125000 * (selectedPeriod === 'year' ? 12 : selectedPeriod === 'quarter' ? 3 : selectedPeriod === 'week' ? 0.25 : 1),
    efficiency: Math.max(85, 94.2 - anomalyImpact * 0.5)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const businessMetrics = [
    {
      title: 'Revenue Impact',
      value: formatCurrency(metricsData.revenue),
      change: `${metricsData.revenueGrowth >= 0 ? '+' : ''}${formatPercentage(metricsData.revenueGrowth)}`,
      trend: metricsData.revenueGrowth >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: metricsData.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: metricsData.revenueGrowth >= 0 ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-red-500/20',
      description: `${selectedPeriod}ly revenue from cable operations`
    },
    {
      title: 'SLA Compliance',
      value: formatPercentage(metricsData.slaCompliance),
      change: `Target: 99.5%`,
      trend: metricsData.slaCompliance >= 99.5 ? 'up' : 'down',
      icon: Target,
      color: metricsData.slaCompliance >= 99.5 ? 'text-green-400' : 'text-yellow-400',
      bgColor: metricsData.slaCompliance >= 99.5 ? 'from-green-500/20 to-emerald-500/20' : 'from-yellow-500/20 to-orange-500/20',
      description: 'Service level agreement compliance rate'
    },
    {
      title: 'Cost Savings',
      value: formatCurrency(metricsData.costSavings),
      change: '+12.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      description: 'Operational cost savings through AI monitoring'
    },
    {
      title: 'Revenue at Risk',
      value: formatCurrency(metricsData.revenueAtRisk),
      change: metricsData.revenueAtRisk > 100000 ? 'High Risk' : 'Low Risk',
      trend: metricsData.revenueAtRisk > 100000 ? 'down' : 'up',
      icon: AlertTriangle,
      color: metricsData.revenueAtRisk > 100000 ? 'text-red-400' : 'text-green-400',
      bgColor: metricsData.revenueAtRisk > 100000 ? 'from-red-500/20 to-red-500/20' : 'from-green-500/20 to-emerald-500/20',
      description: 'Potential revenue loss from current issues'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          💼 Business Metrics
        </h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs rounded-lg border border-blue-500/30 transition-colors disabled:opacity-50"
          >
            <motion.div
              animate={{ rotate: isGeneratingReport ? 360 : 0 }}
              transition={{ duration: 1, repeat: isGeneratingReport ? Infinity : 0, ease: "linear" }}
            >
              <Download className="w-3 h-3" />
            </motion.div>
            {isGeneratingReport ? 'Generating...' : 'Export'}
          </motion.button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((period) => (
          <motion.button
            key={period.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePeriodChange(period.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              selectedPeriod === period.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50'
            }`}
          >
            <period.icon className="w-3 h-3" />
            {period.label}
          </motion.button>
        ))}
      </div>

      {/* Business Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessMetrics.map((metric, index) => {
          const Icon = metric.icon
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`p-4 bg-gradient-to-br ${metric.bgColor} border border-slate-600/30 rounded-xl`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 bg-slate-700/50 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${metric.color}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-300">{metric.title}</h4>
                <p className="text-xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-slate-400">{metric.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Business Alerts */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-300">Business Alerts</h4>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewAllReports}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Eye className="w-3 h-3" />
            View All Reports
          </motion.button>
        </div>
        
        <div className="space-y-2">
          {metricsData.slaCompliance < 99.5 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-300">SLA Compliance Warning</p>
                <p className="text-xs text-yellow-400/80">Current: {metricsData.slaCompliance.toFixed(2)}% | Target: 99.5%</p>
              </div>
              <FileText className="w-4 h-4 text-yellow-400/60" />
            </motion.div>
          )}
          
          {metricsData.revenueAtRisk > 50000 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <DollarSign className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-300">High Revenue Risk</p>
                <p className="text-xs text-red-400/80">${(metricsData.revenueAtRisk / 1000).toFixed(0)}K daily exposure detected</p>
              </div>
              <FileText className="w-4 h-4 text-red-400/60" />
            </motion.div>
          )}
          
          {metricsData.efficiency > 95 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-300">Optimal Performance</p>
                <p className="text-xs text-green-400/80">System efficiency at {metricsData.efficiency.toFixed(1)}%</p>
              </div>
              <FileText className="w-4 h-4 text-green-400/60" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Reports Modal */}
      <AnimatePresence>
        {showReportsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReportsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Business Reports
                </h3>
                <button
                  onClick={() => setShowReportsModal(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'Revenue Analysis', period: selectedPeriod, status: 'Ready' },
                  { name: 'SLA Compliance Report', period: selectedPeriod, status: 'Ready' },
                  { name: 'Cost Optimization', period: selectedPeriod, status: 'Processing' },
                  { name: 'Risk Assessment', period: selectedPeriod, status: 'Ready' },
                ].map((report, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-white">{report.name}</h4>
                      <p className="text-xs text-slate-400">Period: {report.period}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        report.status === 'Ready' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {report.status}
                      </span>
                      {report.status === 'Ready' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => console.log(`Downloading ${report.name}`)}
                          className="p-1 text-blue-400 hover:text-blue-300"
                        >
                          <Download className="w-3 h-3" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Generate New Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 
 