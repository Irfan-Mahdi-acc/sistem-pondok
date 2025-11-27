import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pilih Role | Pondok Management',
}

export default async function SelectRolePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Parse roles from JSON
  let roles: string[] = []
  try {
    // @ts-ignore - roles field exists but not in type
    roles = session.user.roles ? JSON.parse(session.user.roles) : [session.user.role || 'SANTRI']
  } catch {
    // @ts-ignore
    roles = [session.user.role || 'SANTRI']
  }

  console.log('Select role page - User:', session.user.name, 'Roles:', roles)

  // If only 1 role, redirect directly to dashboard
  if (roles.length === 1) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Selamat Datang, {session.user.name}
          </h1>
          <p className="text-muted-foreground">
            Pilih role untuk melanjutkan ke dashboard
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <form key={role} action={`/api/auth/select-role`} method="POST">
              <input type="hidden" name="role" value={role} />
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <UserCircle className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{getRoleDisplayName(role)}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline" className="mb-4">
                    {role}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getRoleDescription(role)}
                  </p>
                  <Button type="submit" className="w-full">
                    Masuk sebagai {getRoleDisplayName(role)}
                  </Button>
                </CardContent>
              </Card>
            </form>
          ))}
        </div>

        <div className="text-center mt-8">
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" type="submit">
              Keluar
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
