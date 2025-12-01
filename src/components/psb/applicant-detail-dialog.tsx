'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface ApplicantDetailDialogProps {
  registration: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApplicantDetailDialog({ registration, open, onOpenChange }: ApplicantDetailDialogProps) {
  if (!registration) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'default'
      case 'ASSIGNED': return 'default'
      case 'ACCEPTED': return 'default'
      case 'REJECTED': return 'destructive'
      case 'DECLINED': return 'destructive'
      case 'INTERVIEW': return 'secondary'
      case 'PAYMENT_VERIFIED': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pendaftar</DialogTitle>
          <DialogDescription>
            Nomor Pendaftaran: {registration.registrationNo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div>
            <h4 className="font-semibold mb-2">Status</h4>
            <div className="flex gap-2">
              <Badge variant={getStatusColor(registration.status) as any}>
                {registration.status}
              </Badge>
              <Badge variant={registration.paymentStatus === 'VERIFIED' ? 'default' : 'outline'}>
                Bayar: {registration.paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="border-t my-4" />

          {/* Personal Info */}
          <div>
            <h4 className="font-semibold mb-3">Data Pribadi</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nama Lengkap:</span>
                <p className="font-medium">{registration.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">NISN:</span>
                <p className="font-medium">{registration.nisn || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Jenis Kelamin:</span>
                <p className="font-medium">{registration.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tempat, Tanggal Lahir:</span>
                <p className="font-medium">
                  {registration.birthPlace}, {format(new Date(registration.birthDate), "d MMMM yyyy", { locale: id })}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Alamat:</span>
                <p className="font-medium">{registration.address}</p>
              </div>
              <div>
                <span className="text-muted-foreground">No. HP:</span>
                <p className="font-medium">{registration.phone}</p>
              </div>
            </div>
          </div>

          <div className="border-t my-4" />

          {/* Parent Info */}
          <div>
            <h4 className="font-semibold mb-3">Data Orang Tua</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nama Ayah:</span>
                <p className="font-medium">{registration.fatherName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nama Ibu:</span>
                <p className="font-medium">{registration.motherName}</p>
              </div>
            </div>
          </div>

          <div className="border-t my-4" />

          {/* School Info */}
          {registration.schoolOrigin && (
            <>
              <div>
                <h4 className="font-semibold mb-3">Asal Sekolah</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nama Sekolah:</span>
                    <p className="font-medium">{registration.schoolOrigin}</p>
                  </div>
                  {registration.schoolNpsn && (
                    <div>
                      <span className="text-muted-foreground">NPSN:</span>
                      <p className="font-medium">{registration.schoolNpsn}</p>
                    </div>
                  )}
                  {registration.schoolAddress && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Alamat Sekolah:</span>
                      <p className="font-medium">{registration.schoolAddress}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t my-4" />
            </>
          )}

          {/* Period Info */}
          <div>
            <h4 className="font-semibold mb-3">Gelombang Pendaftaran</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Gelombang:</span>
                <p className="font-medium">{registration.period?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Lembaga:</span>
                <p className="font-medium">{registration.period?.lembaga?.name}</p>
              </div>
            </div>
          </div>

          {/* Assignment Info */}
          {registration.assignedLembagaId && (
            <>
              <div className="border-t my-4" />
              <div>
                <h4 className="font-semibold mb-3">Penempatan</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Lembaga:</span>
                    <p className="font-medium">{registration.assignedLembaga?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kelas:</span>
                    <p className="font-medium">{registration.assignedKelas?.name}</p>
                  </div>
                  {registration.assignedAt && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Tanggal Penempatan:</span>
                      <p className="font-medium">{format(new Date(registration.assignedAt), "d MMMM yyyy HH:mm", { locale: id })}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Fee Breakdown */}
          {registration.registrationFeeDetails && (
            <>
              <div className="border-t my-4" />
              <div>
                <h4 className="font-semibold mb-3">Rincian Biaya Pendaftaran</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(registration.registrationFeeDetails as Record<string, number>).map(([name, amount]) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-medium">Rp {amount.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>Rp {registration.registrationFee?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="border-t my-4" />
          <div className="text-xs text-muted-foreground">
            <p>Tanggal Daftar: {format(new Date(registration.createdAt), "d MMMM yyyy HH:mm", { locale: id })}</p>
            {registration.updatedAt && registration.updatedAt !== registration.createdAt && (
              <p>Terakhir Update: {format(new Date(registration.updatedAt), "d MMMM yyyy HH:mm", { locale: id })}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
