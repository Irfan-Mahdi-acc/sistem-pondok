// Available permissions for role management
// This file can be imported in both client and server components
export const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard.view', label: 'View Dashboard' },
  { id: 'santri.view', label: 'View Santri' },
  { id: 'santri.create', label: 'Create Santri' },
  { id: 'santri.edit', label: 'Edit Santri' },
  { id: 'santri.delete', label: 'Delete Santri' },
  { id: 'ustadz.view', label: 'View Ustadz' },
  { id: 'ustadz.manage', label: 'Manage Ustadz' },
  { id: 'kelas.view', label: 'View Kelas' },
  { id: 'kelas.manage', label: 'Manage Kelas' },
  { id: 'nilai.view', label: 'View Nilai' },
  { id: 'nilai.input', label: 'Input Nilai' },
  { id: 'keuangan.view', label: 'View Keuangan' },
  { id: 'keuangan.manage', label: 'Manage Keuangan' },
  { id: 'users.view', label: 'View Users' },
  { id: 'users.manage', label: 'Manage Users' },
  { id: 'settings.manage', label: 'Manage Settings' },
]

