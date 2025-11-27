import { getSantriById } from "@/actions/santri-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditSantriDialog } from "@/components/santri/edit-santri-dialog"
import { SantriSummary } from "@/components/santri/santri-summary"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function SantriDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const santri = await getSantriById(id)

  if (!santri) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{santri.nama}</h1>
          <p className="text-sm text-muted-foreground">NIS: {santri.nis}</p>
        </div>
        <div className="flex gap-2">
          <EditSantriDialog santri={santri} />
          <Badge variant={santri.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {santri.status}
          </Badge>
          <Link href="/dashboard/santri">
            <button className="text-sm text-blue-600 hover:underline">← Back to List</button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Ringkasan</TabsTrigger>
          <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
          <TabsTrigger value="guardian">Info Wali</TabsTrigger>
          <TabsTrigger value="academic">Riwayat Akademik</TabsTrigger>
          <TabsTrigger value="tahfidz">Tahfidz</TabsTrigger>
          <TabsTrigger value="violations">Pelanggaran</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <SantriSummary santri={santri} />
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p className="text-base">{santri.nama}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jenis Kelamin</p>
                <p className="text-base">{santri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempat Lahir</p>
                <p className="text-base">{santri.birthPlace || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal Lahir</p>
                <p className="text-base">{santri.birthDate ? new Date(santri.birthDate).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Alamat</p>
                <p className="text-base">{santri.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                <p className="text-base">{santri.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{santri.email || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Administratif</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIS</p>
                <p className="text-base">{santri.nis}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NISN</p>
                <p className="text-base">{santri.nisn || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nomor BPJS</p>
                <p className="text-base">{santri.bpjsNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nomor KK</p>
                <p className="text-base">{santri.kkNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIK</p>
                <p className="text-base">{santri.nikNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sekolah Asal</p>
                <p className="text-base">{santri.previousSchool || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lembaga</p>
                <p className="text-base">{santri.lembaga.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kelas Saat Ini</p>
                <p className="text-base">{santri.kelas?.name || 'Belum Ditentukan'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Asrama</p>
                <p className="text-base">{santri.asrama?.name || 'Belum Ditentukan'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardian" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ayah</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama</p>
                <p className="text-base">{santri.fatherName || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIK</p>
                <p className="text-base">{santri.fatherNik || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                <p className="text-base">{santri.fatherPhone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pekerjaan</p>
                <p className="text-base">{santri.fatherJob || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Penghasilan</p>
                <p className="text-base">{santri.fatherIncome || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ibu</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama</p>
                <p className="text-base">{santri.motherName || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIK</p>
                <p className="text-base">{santri.motherNik || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                <p className="text-base">{santri.motherPhone || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pekerjaan</p>
                <p className="text-base">{santri.motherJob || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Penghasilan</p>
                <p className="text-base">{santri.motherIncome || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {santri.waliName && (
            <Card>
              <CardHeader>
                <CardTitle>Wali</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama</p>
                  <p className="text-base">{santri.waliName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hubungan</p>
                  <p className="text-base">{santri.waliRelation || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIK</p>
                  <p className="text-base">{santri.waliNik || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                  <p className="text-base">{santri.waliPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pekerjaan</p>
                  <p className="text-base">{santri.waliJob || '-'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tahun Ajaran</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {santri.kelasHistory.map((history: any) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.academicYear}</TableCell>
                      <TableCell>{history.kelas.name}</TableCell>
                      <TableCell>{new Date(history.startDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{history.endDate ? new Date(history.endDate).toLocaleDateString('id-ID') : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={history.status === 'CURRENT' ? 'default' : 'secondary'}>
                          {history.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Riwayat Nilai</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Ujian</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {santri.nilais.map((nilai: any) => (
                    <TableRow key={nilai.id}>
                      <TableCell>{nilai.ujian.mapel.name}</TableCell>
                      <TableCell>{nilai.ujian.name}</TableCell>
                      <TableCell>{new Date(nilai.ujian.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium">{nilai.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tahfidz">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tahfidz</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Surah</TableHead>
                    <TableHead>Ayat</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {santri.tahfidzRecords.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{record.surah}</TableCell>
                      <TableCell>{record.ayatStart} - {record.ayatEnd}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{record.grade || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Catatan Pelanggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Tindakan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {santri.violations.map((violation: any) => (
                    <TableRow key={violation.id}>
                      <TableCell>{new Date(violation.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge variant={violation.type === 'CRITICAL' ? 'destructive' : 'secondary'}>
                          {violation.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{violation.category}</TableCell>
                      <TableCell>{violation.description}</TableCell>
                      <TableCell>{violation.action || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={violation.resolved ? 'default' : 'destructive'}>
                          {violation.resolved ? 'Selesai' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
