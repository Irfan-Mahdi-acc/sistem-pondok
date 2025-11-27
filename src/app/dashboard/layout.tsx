'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SessionProvider } from 'next-auth/react'
import { SyncLoadingOverlay } from '@/components/ui/sync-loading-overlay'
import { useState, useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Sync with sidebar's localStorage state
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved) {
        setIsSidebarCollapsed(JSON.parse(saved))
      }
    }

    // Initial load
    handleStorageChange()

    // Listen for changes
    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-window updates
    window.addEventListener('sidebar-toggle', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('sidebar-toggle', handleStorageChange)
    }
  }, [])

  // Smart caching sync logic
  useEffect(() => {
    async function initSync() {
      try {
        // Dynamically import sync service (client-side only)
        const { syncService } = await import('@/lib/sync-service')
        
        // Check for updates
        const updates = await syncService.checkUpdates()
        
        // If data is stale, show loading and sync
        if (updates.hasStaleData) {
          setIsSyncing(true)
          
          // Ensure loading overlay shows for at least 500ms
          const startTime = Date.now()
          await syncService.syncAll()
          
          const elapsed = Date.now() - startTime
          if (elapsed < 500) {
            await new Promise(resolve => setTimeout(resolve, 500 - elapsed))
          }
          
          setIsSyncing(false)
        }
      } catch (error) {
        console.error('Sync initialization error:', error)
        setIsSyncing(false)
      }
    }

    // Run sync after component mounts
    initSync()
  }, [])

  return (
    <SessionProvider>
      <SyncLoadingOverlay isVisible={isSyncing} />
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 md:p-12">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
