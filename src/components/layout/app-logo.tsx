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
        setSettings({ appName: 'Ponpes Tadzimussunnah', logoUrl: '/logo-pondok.png' })
      })
  }, [])

  if (!settings) {
    return (
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="relative h-10 w-10 rounded-lg bg-white p-1 shadow-sm border">
          <Image 
            src="/logo-pondok.png" 
            alt="Logo Pondok" 
            width={40} 
            height={40}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">Ponpes</span>
          <span className="text-sm font-bold leading-tight">Tadzimussunnah</span>
        </div>
      </div>
    )
  }

  const appName = settings?.appName || 'Ponpes Tadzimussunnah'
  const logoUrl = settings?.logoUrl || '/logo-pondok.png'
  
  // Split app name into lines if it's long
  const nameLines = appName.length > 15 ? appName.split(' ') : [appName]

  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <div className="relative h-10 w-10 rounded-lg bg-white p-1 shadow-sm border">
        <Image 
          src={logoUrl} 
          alt="Logo" 
          width={40} 
          height={40}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        {nameLines.length > 1 ? (
          nameLines.map((line: string, i: number) => (
            <span key={i} className="text-sm font-bold leading-tight">{line}</span>
          ))
        ) : (
          <span className="text-base font-bold">{appName}</span>
        )}
      </div>
    </div>
  )
}
