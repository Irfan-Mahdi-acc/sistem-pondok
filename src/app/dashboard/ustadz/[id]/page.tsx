import { Metadata } from 'next'
import { getUstadzById } from '@/actions/ustadz-actions'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { parseRoles } from '@/lib/role-utils'

export const metadata: Metadata = {
  title: 'Detail Ustadz | Pondok Management',
}

export default async function UstadzDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const ustadz = await getUstadzById(id)

  if (!ustadz) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{ustadz.user.name}</h1>
        <p className="text-muted-foreground">Detail informasi ustadz</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">NIK:</span>
              <span className="font-medium">{ustadz.nik || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telepon:</span>
              <span className="font-medium">{ustadz.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alamat:</span>
              <span className="font-medium">{ustadz.address || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempat Lahir:</span>
              <span className="font-medium">{ustadz.birthPlace || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Lahir:</span>
              <span className="font-medium">
                {ustadz.birthDate ? new Date(ustadz.birthDate).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Akademik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spesialisasi:</span>
              <span className="font-medium">{ustadz.specialization || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendidikan:</span>
              <span className="font-medium">{ustadz.education || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={ustadz.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {ustadz.status}
              </Badge>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Roles:</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {parseRoles(ustadz.user.roles).map((role: string) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                )) || (
                  <Badge variant="outline" className="text-xs">{ustadz.user.role}</Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User Account:</span>
              <span className="font-medium">
                {ustadz.user.username.startsWith('temp_') ? 
                  <Badge variant="secondary">Belum terhubung</Badge> : 
                  <Badge variant="default">{ustadz.user.username}</Badge>
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mata Pelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            {ustadz.mapels && ustadz.mapels.length > 0 ? (
              <ul className="space-y-1">
                {ustadz.mapels.map((mapel: any) => (
                  <li key={mapel.id} className="text-sm">
                    • {mapel.nama} - {mapel.kelas?.nama}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Belum mengajar mata pelajaran</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Halqoh</CardTitle>
          </CardHeader>
          <CardContent>
            {ustadz.halqohs && ustadz.halqohs.length > 0 ? (
              <ul className="space-y-1">
                {ustadz.halqohs.map((halqoh: any) => (
                  <li key={halqoh.id} className="text-sm">
                    • {halqoh.nama} ({halqoh.santris?.length || 0} santri)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Belum membina halqoh</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
