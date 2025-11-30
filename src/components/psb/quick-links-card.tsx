'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

interface QuickLinksCardProps {
  activePeriod?: {
    id: string
    name: string
  } | null
}

export function QuickLinksCard({ activePeriod }: QuickLinksCardProps) {
  const [copied, setCopied] = useState(false)
  
  const registrationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/psb/register`
    : '/psb/register'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl)
      setCopied(true)
      toast.success("Link berhasil disalin!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Gagal menyalin link")
    }
  }

  const handleOpenRegistration = () => {
    window.open('/psb/register', '_blank')
  }

  const handleOpenPortal = () => {
    window.open('/psb', '_blank')
  }

  if (!activePeriod) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-200">Tidak Ada Gelombang Aktif</CardTitle>
          <CardDescription className="text-yellow-700 dark:text-yellow-300">
            Silakan buat gelombang pendaftaran baru di menu Gelombang
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Access - {activePeriod.name}</CardTitle>
        <CardDescription>
          Akses cepat ke portal pendaftaran dan link pendaftaran
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button 
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Link Tersalin
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link Pendaftaran
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleOpenRegistration}
          variant="outline"
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Buka Form Pendaftaran
        </Button>

        <Button 
          onClick={handleOpenPortal}
          variant="outline"
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Buka Portal PSB
        </Button>
      </CardContent>
    </Card>
  )
}
