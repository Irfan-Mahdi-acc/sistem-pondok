import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Detail Musyrif | Pondok Management',
}

async function getMusyrifById(id: string) {
  return await prisma.ustadzProfile.findUnique({
    where: { id },
    include: {
      user: true,
    }
  })
}

export default async function MusyrifDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const musyrif = await getMusyrifById(id)

  if (!musyrif || !musyrif.user || musyrif.user.role !== 'MUSYRIF') {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{musyrif.user.name}</h1>
        <p className="text-muted-foreground">Detail informasi musyrif</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">NIK:</span>
              <span className="font-medium">{musyrif.nik || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telepon:</span>
              <span className="font-medium">{musyrif.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alamat:</span>
              <span className="font-medium">{musyrif.address || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendidikan:</span>
              <span className="font-medium">{musyrif.education || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Tugas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Asrama:</span>
              <span className="font-medium">{musyrif.specialization || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={musyrif.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {musyrif.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User Account:</span>
              <span className="font-medium">
                {musyrif.user.username.startsWith('temp_') ? 
                  <Badge variant="secondary">Belum terhubung</Badge> : 
                  <Badge variant="default">{musyrif.user.username}</Badge>
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
