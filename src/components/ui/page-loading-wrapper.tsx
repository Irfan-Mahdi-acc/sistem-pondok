'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from './loading-spinner'

export function PageLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // Short delay to show spinner

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
