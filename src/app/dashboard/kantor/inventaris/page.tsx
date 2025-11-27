import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function InventarisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventaris</h1>
        <p className="text-muted-foreground">
          Kelola inventaris barang dan aset pondok
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Inventaris
          </CardTitle>
          <CardDescription>
            Fitur inventaris akan segera tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Halaman ini akan menampilkan daftar inventaris, kategori barang, 
            kondisi barang, dan riwayat peminjaman.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
