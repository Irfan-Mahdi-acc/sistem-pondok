'use client'

import { useEffect, useState } from 'react'
import { getAppSettings } from '@/actions/settings-actions'
import Image from 'next/image'

export function AppLogo() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    getAppSettings().then(setSettings)
  }, [])

  if (!settings) {
    return (
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="h-8 w-8 rounded-lg bg-blue-600" />
        <span className="text-base font-bold">Sistem Pondok</span>
      </div>
    )
  }

  const appName = settings?.appName || 'Aplikasi Pondok'
  const logoUrl = settings?.logoUrl

  return (
    <div className="flex items-center gap-3 px-3 py-4">
      {logoUrl ? (
        <Image 
          src={logoUrl} 
          alt="Logo" 
          width={32} 
          height={32}
          className="rounded-lg object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
          {appName.charAt(0)}
        </div>
      )}
      <span className="text-base font-bold">{appName}</span>
    </div>
  )
}
