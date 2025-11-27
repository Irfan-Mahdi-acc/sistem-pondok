'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Link from "next/link"

type StaffMember = {
  id: string
  nik: string | null
  phone: string | null
  status: string
  user: {
    id: string
    name: string
    username: string
    role: string
  }
  _count: {
    mapels: number
    halqohs: number
  }
}

export function StaffTable({ staffList }: { staffList: StaffMember[] }) {
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStaff = staffList.filter(staff => {
    const matchesRole = roleFilter === 'ALL' || staff.user.role === roleFilter
    const matchesSearch = staff.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (staff.nik && staff.nik.includes(searchQuery))
    return matchesRole && matchesSearch
  })

  const getDetailUrl = (staff: StaffMember) => {
    const role = staff.user.role.toLowerCase()
    return `/dashboard/${role}/${staff.id}`
  }

  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case 'USTADZ': return 'default'
      case 'PENGURUS': return 'secondary'
      case 'MUSYRIF': return 'outline'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Cari nama atau NIK..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Role</SelectItem>
            <SelectItem value="USTADZ">Ustadz</SelectItem>
            <SelectItem value="PENGURUS">Pengurus</SelectItem>
            <SelectItem value="MUSYRIF">Musyrif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User Account</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.user.name}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(staff.user.role)}>
                      {staff.user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{staff.nik || '-'}</TableCell>
                  <TableCell>{staff.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={staff.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {staff.user.username.startsWith('temp_') ? (
                      <Badge variant="secondary">Belum terhubung</Badge>
                    ) : (
                      <Badge variant="default">{staff.user.username}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={getDetailUrl(staff)}>
                      <Button variant="default" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Menampilkan {filteredStaff.length} dari {staffList.length} pegawai
      </div>
    </div>
  )
}
