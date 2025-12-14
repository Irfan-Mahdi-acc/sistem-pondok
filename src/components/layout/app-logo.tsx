'use client'

import { useEffect, useState } from 'react'
import { getAppSettings } from '@/actions/settings-actions'
import Image from 'next/image'

export function AppLogo() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    getAppSettings()
      .then(setSettings)
      .catch(err => {
        console.error("Failed to load app settings:", err)
        // Set default settings on error to prevent crash
        setSettings({ appName: 'Sistem Pondok', logoUrl: null })
      })
  }, [])

  if (!settings) {
    return (
      <div className="flex items-center gap-3 px-3 py-4">
        <Image 
          src="/logo-pondok.png" 
          alt="Logo Pondok" 
          width={32} 
          height={32}
          className="rounded-lg object-contain"
        />
        <span className="text-base font-bold">Ponpes Tadzimussunnah</span>
      </div>
    )
  }

  const appName = settings?.appName || 'Ponpes Tadzimussunnah'
  const logoUrl = settings?.logoUrl || '/logo-pondok.png'

  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <Image 
        src={logoUrl} 
        alt="Logo" 
        width={32} 
        height={32}
        className="rounded-lg object-contain"
      />
      <span className="text-base font-bold">{appName}</span>
    </div>
  )
}
