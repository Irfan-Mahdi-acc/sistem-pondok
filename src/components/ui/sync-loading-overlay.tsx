'use client'

interface SyncLoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function SyncLoadingOverlay({ isVisible, message }: SyncLoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        
        {/* Message */}
        <p className="text-sm font-medium text-gray-700">
          {message || 'Sedang Sinkronisasi Data Master Terbaru...'}
        </p>
      </div>
    </div>
  )
}
