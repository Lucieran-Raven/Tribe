'use client'

import { useEffect, useState } from 'react'

export function IOSInstallGuide() {
  const [showGuide, setShowGuide] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if iOS and not installed as PWA
    const ua = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    // Check if user has already dismissed the guide
    const hasSeenGuide = localStorage.getItem('ios-install-guide-seen')
    
    setIsIOS(isIOSDevice)
    if (isIOSDevice && !isStandalone && !hasSeenGuide) {
      setShowGuide(true)
    }
  }, [])

  const handleDismiss = () => {
    setShowGuide(false)
    localStorage.setItem('ios-install-guide-seen', 'true')
  }

  if (!showGuide) return null

  return (
    <div className="fixed bottom-0 inset-x-0 bg-blue-600 text-white p-4 m-4 rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">Install Tribe on iPhone</h3>
          <ol className="text-sm mt-2 list-decimal list-inside space-y-1">
            <li>Tap Share button <span className="text-xl">⎙</span></li>
            <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
            <li>Tap &quot;Add&quot; in top right</li>
          </ol>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-white text-xl p-1"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
