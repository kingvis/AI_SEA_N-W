'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Download,
  Eye,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react'

interface ComplianceReportingProps {
  networkStats: {
    active_sensors?: number
    total_readings?: number
    anomalies_detected?: number
    alerts_raised?: number
    uptime_seconds?: number
  }
  className?: string
}

export default function ComplianceReporting({ networkStats, className = '' }: ComplianceReportingProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<any>(null)
  const [showAuditModal, setShowAuditModal] = useState(false)

  // Handle report generation
  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true)
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const reportData = {
        title: `Compliance Report - ${new Date().toLocaleDateString()}`,
        generated: new Date().toISOString(),
        summary: {
          compliance_score: 96.7,
          total_checks: 247,
          passed: 239,
          warnings: 6,
          failures: 2
        },
        details: networkStats
      }
      
      // Create and download report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Report generation failed:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }, [networkStats])

  // Handle audit view
  const handleViewAudit = useCallback((audit: any) => {
    setSelectedAudit(audit)
    setShowAuditModal(true)
  }, [])

  // Handle report download
  const handleDownloadReport = useCallback((report: any) => {
    const reportData = {
      ...report,
      downloaded_at: new Date().toISOString(),
      system_stats: networkStats
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [networkStats])

  // Handle report preview
  const handlePreviewReport = useCallback((report: any) => {
    console.log('Opening report preview:', report.title)
    // In a real application, this would open a detailed view
    alert(`Preview: ${report.title}\n\nGenerated: ${report.date}\nStatus: ${report.status}\nSize: ${report.size}`)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'audits', label: 'Audits', icon: CheckCircle },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ]

  const complianceItems = [
    {
      title: 'Infrastructure Compliance Review',
      status: 'compliant',
      lastCheck: '2024-01-15',
      score: 98.5,
      description: 'All underwater cable infrastructure meets regulatory standards'
    },
    {
      title: 'Security Protocol Validation',
      status: 'warning',
      lastCheck: '2024-01-14',
      score: 87.2,
      description: 'Minor security configuration updates recommended'
    },
    {
      title: 'Environmental Impact Assessment',
      status: 'compliant',
      lastCheck: '2024-01-13',
      score: 95.8,
      description: 'Environmental monitoring within acceptable parameters'
    },
    {
      title: 'Data Protection Compliance',
      status: 'compliant',
      lastCheck: '2024-01-12',
      score: 99.1,
      description: 'Full compliance with data protection regulations'
    }
  ]

  const recentAudits = [
    {
      id: 1,
      title: 'Q1 2024 Security Audit',
      date: '2024-01-10',
      findings: '3 minor issues identified',
      severity: 'low',
      details: 'Routine security audit completed with minimal findings. All critical systems secure.'
    },
    {
      id: 2,
      title: 'Infrastructure Assessment',
      date: '2024-01-05',
      findings: 'All systems operational',
      severity: 'none',
      details: 'Comprehensive infrastructure review shows excellent system health.'
    },
    {
      id: 3,
      title: 'Compliance Verification',
      date: '2023-12-28',
      findings: '1 documentation update needed',
      severity: 'low',
      details: 'Minor documentation updates required for full compliance.'
    }
  ]

  const reports = [
    {
      title: 'Compliance Dashboard Export',
      date: '2024-01-15',
      status: 'Ready',
      size: '2.4 MB',
      type: 'PDF'
    },
    {
      title: 'Security Assessment Report',
      date: '2024-01-10',
      status: 'Ready',
      size: '1.8 MB',
      type: 'PDF'
    },
    {
      title: 'Infrastructure Health Report',
      date: '2024-01-08',
      status: 'Processing',
      size: '3.1 MB',
      type: 'PDF'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'non-compliant': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'non-compliant': return <AlertTriangle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      case 'none': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📋 Compliance Reporting
        </h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 text-xs rounded-lg border border-green-500/30 transition-colors disabled:opacity-50"
          >
            <motion.div
              animate={{ rotate: isGeneratingReport ? 360 : 0 }}
              transition={{ duration: 1, repeat: isGeneratingReport ? Infinity : 0, ease: "linear" }}
            >
              <BarChart3 className="w-3 h-3" />
            </motion.div>
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </motion.button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-700/30 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Active Sensors', value: networkStats.active_sensors || 0, icon: Shield, color: 'green' },
                { title: 'Total Readings', value: networkStats.total_readings || 0, icon: FileText, color: 'blue' },
                { title: 'Anomalies Detected', value: networkStats.anomalies_detected || 0, icon: AlertTriangle, color: 'yellow' },
                { title: 'Alerts Raised', value: networkStats.alerts_raised || 0, icon: Clock, color: 'red' }
              ].map((item) => (
                <div key={item.title} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{item.title}</span>
                    <item.icon className={`w-4 h-4 ${item.color === 'green' ? 'text-green-400' : item.color === 'blue' ? 'text-blue-400' : item.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`} />
                  </div>
                  <p className={`text-2xl font-bold ${item.color === 'green' ? 'text-green-400' : item.color === 'blue' ? 'text-blue-400' : item.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Uptime */}
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">System Uptime</h4>
                <span className="text-2xl font-bold text-green-400">{networkStats.uptime_seconds ? new Date(networkStats.uptime_seconds * 1000).toISOString().slice(11, 19) : 'N/A'}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full"
                  style={{ width: `${networkStats.uptime_seconds ? (networkStats.uptime_seconds / (networkStats.uptime_seconds + 1000)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Compliance Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    {getStatusIcon(item.status)}
                  </div>
                  <p className="text-lg font-bold text-white">{item.score}%</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                  <p className="text-xs text-slate-400">Last Check: {item.lastCheck}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'audits' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">Recent Audits</h4>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
                <BarChart3 className="w-3 h-3" />
                View All Audits
              </button>
            </div>

            {recentAudits.map((audit, index) => (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">{audit.title}</h4>
                      <span className="text-xs text-slate-400">({audit.id})</span>
                    </div>
                    <p className="text-xs text-slate-400">Date: {audit.date}</p>
                    <p className="text-xs text-slate-400">Findings: {audit.findings}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(audit.severity)}`}>
                      {audit.severity}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <p className="text-slate-300 font-medium">{audit.date}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Findings:</span>
                    <p className="text-slate-300 font-medium">{audit.findings}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Severity:</span>
                    <p className={`font-medium ${getSeverityColor(audit.severity)}`}>{audit.severity}</p>
                  </div>
                  <div className="flex justify-end">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewAudit(audit)}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">Available Reports</h4>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <motion.div
                  animate={{ rotate: isGeneratingReport ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isGeneratingReport ? Infinity : 0, ease: "linear" }}
                >
                  <BarChart3 className="w-3 h-3" />
                </motion.div>
                {isGeneratingReport ? 'Generating...' : 'Generate New Report'}
              </motion.button>
            </div>

            {reports.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-white">{report.title}</h4>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                        {report.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Date:</span>
                        <p className="text-slate-300">{report.date}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Status:</span>
                        <p className={`text-slate-300 font-medium ${getStatusColor(report.status)}`}>{report.status}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Size:</span>
                        <p className="text-slate-300">{report.size}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Type:</span>
                        <p className="text-slate-300">{report.type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePreviewReport(report)}
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                      title="Preview Report"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownloadReport(report)}
                      className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Audit Details Modal */}
      <AnimatePresence>
        {showAuditModal && selectedAudit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAuditModal(false)}
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
                  <CheckCircle className="w-5 h-5" />
                  Audit Details
                </h3>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400 rotate-45" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">{selectedAudit.title}</h4>
                  <p className="text-slate-300 text-sm">{selectedAudit.details}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <p className="text-slate-300 font-medium">{selectedAudit.date}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Severity:</span>
                    <p className={`font-medium ${getSeverityColor(selectedAudit.severity)}`}>
                      {selectedAudit.severity || 'None'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="text-slate-400">Findings:</span>
                  <p className="text-slate-300 font-medium">{selectedAudit.findings}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-700/50">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAuditModal(false)
                      console.log('Downloading audit report:', selectedAudit.title)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Full Report
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add final View Report button functionality */}
      <style jsx>{`
        .compliance-item:hover .view-report-btn {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </motion.div>
  )
} 
 