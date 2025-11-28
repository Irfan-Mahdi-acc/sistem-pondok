import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Detail Pengurus | Pondok Management',
}

async function getPengurusById(id: string) {
  return await prisma.ustadzProfile.findUnique({
    where: { id },
    include: {
      user: true,
    }
  })
}

export default async function PengurusDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const pengurus = await getPengurusById(id)

  if (!pengurus || !pengurus.user || pengurus.user.role !== 'PENGURUS') {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{pengurus.user.name}</h1>
        <p className="text-muted-foreground">Detail informasi pengurus</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">NIK:</span>
              <span className="font-medium">{pengurus.nik || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telepon:</span>
              <span className="font-medium">{pengurus.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alamat:</span>
              <span className="font-medium">{pengurus.address || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendidikan:</span>
              <span className="font-medium">{pengurus.education || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Jabatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jabatan:</span>
              <span className="font-medium">{pengurus.specialization || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={pengurus.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {pengurus.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User Account:</span>
              <span className="font-medium">
                {pengurus.user.username.startsWith('temp_') ? 
                  <Badge variant="secondary">Belum terhubung</Badge> : 
                  <Badge variant="default">{pengurus.user.username}</Badge>
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
