import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCircle } from 'lucide-react'
import { parseRoles } from '@/lib/role-utils'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: 'Pilih Role | Pondok Management',
}

export default async function SelectRolePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Parse roles (PostgreSQL compatible)
  // @ts-ignore - roles field exists but not in type
  const roles = parseRoles(session.user.roles) || [session.user.role || 'SANTRI']

  console.log('Select role page - User:', session.user.name, 'Roles:', roles)

  // If only 1 role, redirect directly to dashboard
  if (roles.length === 1) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Selamat Datang, {session.user.name}
          </h1>
          <p className="text-muted-foreground">
            Pilih role untuk melanjutkan ke dashboard
          </p>
          <Badge variant="outline" className="mt-2">
            {roles.length} Role Tersedia
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <form key={role} action={`/api/auth/select-role`} method="POST">
              <input type="hidden" name="role" value={role} />
              <Card className="group relative overflow-hidden border transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <UserCircle className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-lg font-medium">{getRoleDisplayName(role)}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0 pb-6">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {getRoleDescription(role)}
                  </p>
                  <Button type="submit" className="w-full" variant="secondary">
                    Masuk
                  </Button>
                </CardContent>
                <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </Card>
            </form>
          ))}
        </div>

        <div className="text-center">
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" type="submit" size="sm" className="text-muted-foreground hover:text-foreground">
              Keluar dari Akun
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    'SUPER_ADMIN': 'Super Admin',
    'ADMIN': 'Administrator',
    'MUDIR': 'Mudir (Kepala Lembaga)',
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

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    'SUPER_ADMIN': 'Akses penuh ke seluruh sistem',
    'ADMIN': 'Mengelola data dan pengguna',
    'MUDIR': 'Memimpin dan mengelola lembaga',
    'USTADZ': 'Mengelola pembelajaran dan santri',
    'PENGURUS': 'Mengelola administrasi pondok',
    'MUSYRIF': 'Membimbing santri di asrama',
    'ADMIN_KANTOR': 'Mengelola administrasi kantor',
    'WALI_SANTRI': 'Memantau perkembangan santri',
    'SANTRI': 'Akses informasi pribadi',
    'BENDAHARA': 'Mengelola keuangan',
  }
  return descriptions[role] || 'Akses sistem'
}
