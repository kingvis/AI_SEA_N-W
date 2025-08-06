'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cable, Waves, Shield, Activity, ChevronDown, Globe, Server, Settings, Bell, Volume2, VolumeX } from 'lucide-react'

interface HeaderProps {
  onRefreshData?: () => void
  onShowSettings?: () => void
  onShowNotifications?: () => void
  soundEnabled?: boolean
  onToggleSound?: () => void
  soundVolume?: number
  onVolumeChange?: (volume: number) => void
  systemStatus?: {
    monitoring: boolean
    network: 'online' | 'offline' | 'degraded'
    aiProtection: 'active' | 'inactive' | 'scanning'
  }
}

export default function Header({ 
  onRefreshData,
  onShowSettings,
  onShowNotifications,
  soundEnabled = true,
  onToggleSound,
  soundVolume = 0.6,
  onVolumeChange,
  systemStatus = {
    monitoring: true,
    network: 'online',
    aiProtection: 'active'
  }
}: HeaderProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showAIDropdown, setShowAIDropdown] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date())
    onRefreshData?.()
  }, [onRefreshData])

  const getNetworkStatusColor = () => {
    switch (systemStatus.network) {
      case 'online': return 'text-green-400 from-green-500/15 to-emerald-500/15 border-green-500/20'
      case 'degraded': return 'text-yellow-400 from-yellow-500/15 to-orange-500/15 border-yellow-500/20'
      case 'offline': return 'text-red-400 from-red-500/15 to-red-500/15 border-red-500/20'
      default: return 'text-blue-400 from-blue-500/15 to-cyan-500/15 border-blue-500/20'
    }
  }

  const getAIStatusColor = () => {
    switch (systemStatus.aiProtection) {
      case 'active': return 'text-green-400 from-green-500/15 to-emerald-500/15 border-green-500/20'
      case 'scanning': return 'text-purple-400 from-purple-500/15 to-violet-500/15 border-purple-500/20'
      case 'inactive': return 'text-red-400 from-red-500/15 to-red-500/15 border-red-500/20'
      default: return 'text-purple-400 from-purple-500/15 to-violet-500/15 border-purple-500/20'
    }
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50 shadow-2xl"
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <div className="flex items-center justify-between py-4">
          {/* Enhanced Logo and Title */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl shadow-xl shadow-blue-500/20"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl"
              />
              <Cable className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
            </motion.div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent tracking-tight">
                  CableGuard AI
                </h1>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
                />
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-slate-400 text-sm font-medium hidden sm:block">Enterprise Submarine Cable Infrastructure</p>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="hidden lg:flex items-center space-x-1 text-xs text-slate-500"
                >
                  <Server className="w-3 h-3" />
                  <span>v2.1.4</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Professional Status Indicators & Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Monitoring Status */}
            <motion.button 
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className={`flex items-center space-x-2 bg-gradient-to-r ${systemStatus.monitoring ? 'from-green-500/15 to-emerald-500/15 text-green-400 border-green-500/20' : 'from-red-500/15 to-red-500/15 text-red-400 border-red-500/20'} px-3 py-2.5 rounded-xl border cursor-pointer shadow-lg transition-all duration-300 backdrop-blur-sm hover:shadow-lg min-h-[3.5rem]`}
              title={`Last refresh: ${lastRefresh.toLocaleTimeString()}`}
            >
              <motion.div
                animate={{ 
                  scale: systemStatus.monitoring ? [1, 1.2, 1] : [1, 0.8, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                }}
                className="relative flex-shrink-0"
              >
                <Activity className="w-4 h-4" strokeWidth={2} />
                {systemStatus.monitoring && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full shadow-sm"
                  />
                )}
              </motion.div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-sm font-semibold leading-tight whitespace-nowrap hidden sm:inline">
                  {systemStatus.monitoring ? 'Live Monitoring' : 'Monitoring Offline'}
                </span>
                <span className="text-xs opacity-80 leading-tight hidden lg:inline">
                  {systemStatus.monitoring ? 'Active Systems' : 'Check Connection'}
                </span>
              </div>
              <span className="text-sm font-semibold sm:hidden">
                {systemStatus.monitoring ? 'Live' : 'Off'}
              </span>
            </motion.button>
            
            {/* Network Status with Dropdown */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`hidden md:flex items-center space-x-2 bg-gradient-to-r ${getNetworkStatusColor()} px-3 py-2.5 rounded-xl border cursor-pointer shadow-lg transition-all duration-300 backdrop-blur-sm hover:shadow-lg min-h-[3.5rem]`}
              >
                <motion.div
                  animate={{ y: [-1, 1, -1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex-shrink-0"
                >
                  <Waves className="w-4 h-4" strokeWidth={2} />
                </motion.div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-sm font-semibold leading-tight whitespace-nowrap">Deep Sea Network</span>
                  <span className="text-xs opacity-80 leading-tight hidden lg:inline capitalize">{systemStatus.network}</span>
                </div>
                <motion.div
                  animate={{ rotate: showStatusDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </motion.button>

              {/* Network Status Dropdown */}
              <AnimatePresence>
                {showStatusDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl min-w-[280px] z-50"
                  >
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Network Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className={`font-medium capitalize ${getNetworkStatusColor().split(' ')[0]}`}>
                            {systemStatus.network}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Global Coverage:</span>
                          <span className="text-slate-300">99.7%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Cables:</span>
                          <span className="text-slate-300">847</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Check:</span>
                          <span className="text-slate-300">{lastRefresh.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* AI Protection with Dropdown */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAIDropdown(!showAIDropdown)}
                className={`hidden lg:flex items-center space-x-2 bg-gradient-to-r ${getAIStatusColor()} px-3 py-2.5 rounded-xl border cursor-pointer shadow-lg transition-all duration-300 backdrop-blur-sm group hover:shadow-lg min-h-[3.5rem]`}
              >
                <motion.div
                  animate={{ 
                    rotate: systemStatus.aiProtection === 'scanning' ? [0, 360] : [0, 0],
                    scale: systemStatus.aiProtection === 'active' ? [1, 1.1, 1] : [1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity }
                  }}
                  className="relative flex-shrink-0"
                >
                  <Shield className="w-4 h-4" strokeWidth={2} />
                  {systemStatus.aiProtection === 'active' && (
                    <motion.div
                      animate={{ scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full shadow-sm"
                    />
                  )}
                </motion.div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-sm font-semibold leading-tight whitespace-nowrap">AI Protected</span>
                  <span className="text-xs opacity-80 leading-tight capitalize">{systemStatus.aiProtection}</span>
                </div>
                <motion.div
                  animate={{ rotate: showAIDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </motion.button>

              {/* AI Protection Dropdown */}
              <AnimatePresence>
                {showAIDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl min-w-[300px] z-50"
                  >
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        AI Defense Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Protection:</span>
                          <span className={`font-medium capitalize ${getAIStatusColor().split(' ')[0]}`}>
                            {systemStatus.aiProtection}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Threats Blocked:</span>
                          <span className="text-slate-300">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Neural Network:</span>
                          <span className="text-slate-300">v3.2.1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Scan:</span>
                          <span className="text-slate-300">2m ago</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => console.log('Starting AI scan...')}
                        className="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/30 transition-colors text-sm"
                      >
                        🔍 Run Deep Scan
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700/50 min-h-[3.5rem]">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowNotifications}
                className="p-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg border border-slate-600/50 transition-all duration-300 flex items-center justify-center"
                title="Show Notifications"
              >
                <motion.div className="relative">
                  <Bell className="w-4 h-4" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"
                  />
                </motion.div>
              </motion.button>

              {/* Sound Controls */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleSound}
                className={`p-2.5 transition-all duration-300 rounded-lg border flex items-center justify-center ${
                  soundEnabled 
                    ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30' 
                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-500 border-slate-600/50'
                }`}
                title={soundEnabled ? 'Disable Alert Sounds' : 'Enable Alert Sounds'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </motion.button>

              {/* Volume Control */}
              {soundEnabled && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 px-2 py-1 bg-slate-700/50 rounded-lg border border-slate-600/50"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={soundVolume}
                    onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                    title={`Volume: ${Math.round(soundVolume * 100)}%`}
                  />
                  <span className="text-xs text-slate-400 min-w-[2rem]">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </motion.div>
              )}

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowSettings}
                className="p-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg border border-slate-600/50 transition-all duration-300 flex items-center justify-center"
                title="System Settings"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}