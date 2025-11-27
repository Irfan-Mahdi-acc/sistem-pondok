'use client'

import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { parseRoles } from "@/lib/role-utils"
import { useState, useEffect } from "react"

export function Header() {
  const { data: session } = useSession()
  const [selectedRole, setSelectedRole] = useState<string>('')

  useEffect(() => {
    // Get selected role from cookie
    const cookies = document.cookie.split(';')
    const roleCookie = cookies.find(c => c.trim().startsWith('selected-role='))
    if (roleCookie) {
      setSelectedRole(roleCookie.split('=')[1])
    }
  }, [])

  if (!session?.user) return null

  const userInitials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  // @ts-ignore
  const userRoles = parseRoles(session.user.roles) || [session.user.role || 'SANTRI']
  const displayRole = selectedRole || session.user.role
  const hasMultipleRoles = userRoles.length > 1

  const handleSignOut = async () => {
    // Clear selected-role cookie on client side
    document.cookie = 'selected-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    // Sign out
    await signOut({ callbackUrl: '/login' })
  }

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMIN': 'Administrator',
      'MUDIR': 'Mudir',
      'USTADZ': 'Ustadz',
      'PENGURUS': 'Pengurus',
      'MUSYRIF': 'Musyrif',
      'ADMIN_KANTOR': 'Admin Kantor',
      'WALI_SANTRI': 'Wali Santri',
      'SANTRI': 'Santri',
      'BENDAHARA': 'Bendahara',
    }
    return roleNames[role] || role
  }

  return (
    <header className="border-b bg-gradient-to-r from-background via-background to-primary/5 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={undefined} alt={session.user.name || ''} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getRoleDisplayName(displayRole)}
                    </Badge>
                    {hasMultipleRoles && (
                      <span className="text-xs text-muted-foreground">
                        +{userRoles.length - 1} role
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil Saya</span>
                </Link>
              </DropdownMenuItem>
              {hasMultipleRoles && (
                <DropdownMenuItem asChild>
                  <Link href="/select-role" className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Ganti Role</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {(displayRole === 'SUPER_ADMIN' || displayRole === 'ADMIN') && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
