// Helper to show toast notifications from dialogs
// Since dialogs are client components but can't directly use useToast hook,
// we use window.dispatchEvent to communicate with ToastProvider

export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message, type } 
    }))
  }
}

export function showSuccess(message: string) {
  showToast(message, 'success')
}

export function showError(message: string) {
  showToast(message, 'error')
}

export function showWarning(message: string) {
  showToast(message, 'warning')
}

export function showInfo(message: string) {
  showToast(message, 'info')
}
