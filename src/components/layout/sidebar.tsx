'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  Shield,
  UserCircle,
  Settings,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  FileText,
  UserPlus,
} from 'lucide-react'
import { AppLogo } from './app-logo'
import { Button } from '@/components/ui/button'

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lembaga', label: 'Lembaga', icon: Building2 },
]

const staffItems = [
  { href: '/dashboard/pegawai', label: 'Dashboard Pegawai', icon: Users },
  { href: '/dashboard/ustadz', label: 'Ustadz', icon: UserCircle },
  { href: '/dashboard/pengurus', label: 'Pengurus', icon: Shield },
  { href: '/dashboard/musyrif', label: 'Musyrif', icon: Building2 },
]

const santriItems = [
  { href: '/dashboard/santri', label: 'Data Santri', icon: GraduationCap },
  { 
    label: 'Manajemen Pondok', 
    icon: Building2,
    isGroup: true,
    items: [
      { href: '/dashboard/asrama', label: 'Asrama', icon: Building2 },
      { href: '/dashboard/aktivitas', label: 'Aktivitas Harian', icon: Calendar },
    ]
  },
]

const psbItems = [
  { href: '/dashboard/psb', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/psb/periods', label: 'Gelombang', icon: Calendar },
  { href: '/dashboard/psb/applicants', label: 'Pendaftar', icon: Users },
]

const academicItems = [
  { href: '/dashboard/academic/calendar', label: 'Kalender Akademik', icon: Calendar },
  { href: '/dashboard/academic/mapel', label: 'Mata Pelajaran', icon: BookOpen },
  { href: '/dashboard/academic/nilai-raport', label: 'Nilai & Raport', icon: FileText },
  { href: '/dashboard/academic/kenaikan-kelas', label: 'Kenaikan Kelas', icon: GraduationCap },
]

const halqohHifdzItems = [
  { href: '/dashboard/academic/halqoh', label: 'Halqoh', icon: BookOpen },
  { href: '/dashboard/academic/tahfidz', label: 'Tahfidz', icon: BookOpen },
]

const financeItems = [
  { href: '/dashboard/finance/billing', label: 'Tagihan', icon: DollarSign },
  { href: '/dashboard/finance/payments', label: 'Pembayaran', icon: DollarSign },
  { href: '/dashboard/finance/transactions', label: 'Transaksi', icon: DollarSign },
  { href: '/dashboard/finance/bookkeeping', label: 'Laporan Keuangan', icon: BookOpen },
  { href: '/dashboard/finance/bookkeeping-management', label: 'Manajemen Pembukuan', icon: BookOpen },
]

const settingsItems = [
  { href: '/dashboard/settings', label: 'Pengaturan Aplikasi', icon: Settings },
  { href: '/dashboard/settings/users', label: 'Pengguna', icon: Users },
  { href: '/dashboard/roles', label: 'Role & Izin', icon: Shield },
]

const reportItems = [
  { href: '/dashboard/reports', label: 'Laporan', icon: FileText },
]

const kantorItems = [
  { href: '/dashboard/kantor/surat', label: 'Surat Menyurat', icon: FileText },
  { href: '/dashboard/kantor/inventaris', label: 'Inventaris', icon: Building2 },
  { href: '/dashboard/kantor/agenda', label: 'Agenda', icon: Calendar },
]

// Separate component for nested group to avoid React Hooks violation
function NestedGroupItem({ item, pathname }: { item: any; pathname: string }) {
  const [isSubOpen, setIsSubOpen] = useState(() => {
    return item.items.some((subItem: any) => 
      pathname === subItem.href || pathname.startsWith(subItem.href + '/')
    )
  })
  
  const hasActiveSubItem = item.items.some((subItem: any) => 
    pathname === subItem.href || pathname.startsWith(subItem.href + '/')
  )
  
  const GroupIcon = item.icon
  
  return (
    <div>
      <button
        onClick={() => setIsSubOpen(!isSubOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          hasActiveSubItem
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <GroupIcon className="h-4 w-4" />
          {item.label}
        </div>
        {isSubOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
      {isSubOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-3">
          {item.items.map((subItem: any) => {
            const SubItemIcon = subItem.icon
            const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
            
            return (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isSubActive
                    ? 'bg-foreground border-2 border-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border-2 border-transparent'
                )}
              >
                <SubItemIcon className="h-4 w-4" />
                {subItem.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NavSection({ 
  title, 
  icon: Icon, 
  items, 
  pathname,
  isCollapsed 
}: { 
  title: string
  icon: any
  items: any[]
  pathname: string
  isCollapsed?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasActive = items.some((item: any) => {
      if (item.isGroup && item.items) {
        return item.items.some((subItem: any) => pathname.startsWith(subItem.href))
      }
      return pathname.startsWith(item.href)
    })
    setIsOpen(hasActive)
  }, [pathname, items])

  const hasActiveItem = items.some((item: any) => {
    if (item.isGroup && item.items) {
      return item.items.some((subItem: any) => 
        pathname === subItem.href || pathname.startsWith(subItem.href + '/')
      )
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
  })

  if (isCollapsed) {
    return (
      <div className="relative group">
        <button
          className={cn(
            'flex w-full items-center justify-center rounded-lg p-2 text-sm transition-colors',
            hasActiveItem
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          title={title}
        >
          <Icon className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          hasActiveItem
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {title}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-3">
          {items.map((item: any) => {
            // Handle nested group - use separate component
            if (item.isGroup && item.items) {
              return <NestedGroupItem key={item.label} item={item} pathname={pathname} />
            }
            
            // Handle regular item
            const ItemIcon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-foreground border-2 border-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border-2 border-transparent'
                )}
              >
                <ItemIcon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
    window.dispatchEvent(new Event('sidebar-toggle'))
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="border-b flex items-center justify-between p-4">
        {!isCollapsed && <AppLogo />}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("h-8 w-8", isCollapsed && "mx-auto")}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || pathname.startsWith(item.href + '/')

          if (isCollapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-center rounded-lg p-2 text-sm transition-colors',
                  isActive
                    ? 'bg-foreground border-2 border-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border-2 border-transparent'
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-foreground border-2 border-foreground text-background font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border-2 border-transparent'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-4">
          <NavSection 
            title="Pegawai" 
            icon={Users} 
            items={staffItems} 
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        </div>

        <NavSection 
          title="Santri" 
          icon={GraduationCap} 
          items={santriItems} 
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        <NavSection 
          title="PSB" 
          icon={UserPlus} 
          items={psbItems} 
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        <NavSection 
          title="Akademik" 
          icon={BookOpen} 
          items={academicItems} 
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        <NavSection 
          title="Halqoh & Hifdz" 
          icon={BookOpen} 
          items={halqohHifdzItems} 
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        <NavSection 
          title="Keuangan" 
          icon={DollarSign} 
          items={financeItems} 
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        <NavSection 
          title="Kantor" 
          icon={Building2} 
          items={kantorItems} 
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        <div className="pt-4">
          <NavSection 
            title="Pengaturan" 
            icon={Settings} 
            items={settingsItems} 
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>
    </div>
  )
}
