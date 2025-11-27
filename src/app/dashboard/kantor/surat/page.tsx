import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function SuratMenyuratPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat Menyurat</h1>
        <p className="text-muted-foreground">
          Kelola surat masuk dan surat keluar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Surat Menyurat
          </CardTitle>
          <CardDescription>
            Fitur surat menyurat akan segera tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Halaman ini akan menampilkan manajemen surat masuk, surat keluar, 
            arsip surat, dan template surat.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
