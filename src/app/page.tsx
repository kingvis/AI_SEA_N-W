'use client'

import React, { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import GlobePage from '@/components/GlobePage'

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'globe'>('dashboard')

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {currentView === 'dashboard' ? (
        <Dashboard onOpenGlobe={() => setCurrentView('globe')} />
      ) : (
        <GlobePage onBack={() => setCurrentView('dashboard')} />
      )}
    </main>
  )