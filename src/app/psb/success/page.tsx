import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  const registrationId = searchParams.id

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pendaftaran Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Terima kasih telah mendaftar. Data Anda telah kami terima.
          </p>
          {registrationId && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">Nomor Pendaftaran:</p>
              <p className="text-2xl font-bold tracking-wider">{registrationId}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Simpan nomor ini untuk mengecek status pendaftaran Anda.
              </p>
            </div>
          )}
          <div className="pt-4">
            <Link href="/psb/check">
              <Button className="w-full">Cek Status Pendaftaran</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
