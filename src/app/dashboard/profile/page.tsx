import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/profile-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog"
import { parseRoles } from "@/lib/role-utils"
import { User, Shield, Calendar, Key } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const userRoles = parseRoles(user.roles) || [user.role]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi akun Anda
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informasi Akun */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Akun
              </CardTitle>
            </div>
            <EditProfileDialog user={user} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
              <p className="text-base font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-base font-mono">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dibuat</p>
              <p className="text-sm">
                {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: localeId })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role & Akses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Akses
            </CardTitle>
            <CardDescription>
              {userRoles.length > 1 
                ? `Anda memiliki ${userRoles.length} role`
                : 'Role akun Anda'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
            {userRoles.length > 1 && (
              <Link href="/select-role">
                <Button variant="outline" size="sm" className="w-full">
                  Ganti Role Aktif
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Keamanan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Keamanan
              </CardTitle>
            </div>
            <ChangePasswordDialog />
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Password</p>
              <p className="text-sm">••••••••</p>
            </div>
            {user.passwordChangedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terakhir diubah</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(user.passwordChangedAt), 'dd MMM yyyy HH:mm', { locale: localeId })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aktivitas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Akun dibuat</p>
              <p className="text-sm">
                {format(new Date(user.createdAt), 'dd MMMM yyyy, HH:mm', { locale: localeId })}
              </p>
            </div>
            {user.passwordChangedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Password terakhir diubah</p>
                <p className="text-sm">
                  {format(new Date(user.passwordChangedAt), 'dd MMMM yyyy, HH:mm', { locale: localeId })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
