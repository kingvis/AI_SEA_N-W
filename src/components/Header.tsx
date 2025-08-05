'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Cable, Waves, Shield, Activity } from 'lucide-react'

interface HeaderProps {
  onDeepSeaNetworkClick?: () => void
  isGlobeVisible?: boolean
}

export default function Header({ onDeepSeaNetworkClick, isGlobeVisible }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"
            >
              <Cable className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CableGuard AI
              </h1>
              <p className="text-slate-400 text-sm">Underwater Cable Monitoring System</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg border border-green-500/30"
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Live Monitoring</span>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-green-300">Active Systems</span>
              </div>
            </motion.div>
            
            {/* Clickable Deep Sea Network Button */}
            <motion.button
              onClick={onDeepSeaNetworkClick}
              whileHover={{ scale: 1.05, backgroundColor: isGlobeVisible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer group ${
                isGlobeVisible 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 hover:border-green-400/50' 
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-400/50'
              }`}
              title={isGlobeVisible ? "Click to hide Global Sensor Network" : "Click to view Global Sensor Network"}
            >
              <Waves className={`w-4 h-4 ${isGlobeVisible ? 'animate-pulse' : 'group-hover:animate-pulse'}`} />
              <span className="text-sm font-medium">Deep Sea Network</span>
              <div className="flex items-center gap-1 ml-2">
                <span className={`text-xs ${isGlobeVisible ? 'text-green-300' : 'text-blue-300'}`}>
                  {isGlobeVisible ? 'Visible' : 'Global Coverage'}
                </span>
                <span className={`text-xs ${isGlobeVisible ? 'text-green-400' : 'text-blue-400'}`}>
                  {isGlobeVisible ? '👁️' : '🌍'}
                </span>
              </div>
            </motion.button>
            
            <div className="flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg border border-purple-500/30">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">AI Protected</span>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-purple-300">Neural Defense</span>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-xs"
                >
                  ⚡
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )