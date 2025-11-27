import { getDocuments, getDocumentStats } from "@/actions/surat-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddDocumentDialog } from "@/components/surat/add-document-dialog"
import { DocumentTable } from "@/components/surat/document-table"
import { FileText, Inbox, Send, FileCheck } from "lucide-react"

export default async function SuratMenyuratPage() {
  const [documents, stats, lembagas] = await Promise.all([
    getDocuments(),
    getDocumentStats(),
    getLembagas()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surat Menyurat</h1>
          <p className="text-muted-foreground">
            Kelola surat dan dokumen pondok & lembaga
          </p>
        </div>
        <AddDocumentDialog lembagas={lembagas} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surat Masuk</CardTitle>
            <Inbox className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.suratMasuk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surat Keluar</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.suratKeluar}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surat Keputusan</CardTitle>
            <FileCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.sk}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arsip Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentTable documents={documents} />
        </CardContent>
      </Card>
    </div>
  )
}
