'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Edit } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { ApproveUserDialog } from "./approve-user-dialog"

type PendingUser = {
  id: string
  username: string
  name: string
  email: string | null
  role: string
  isApproved: boolean
  createdAt: Date
  emailVerified: Date | null
  accounts: { provider: string }[]
}

export function UserApprovalTable({ users }: { users: PendingUser[] }) {
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const router = useRouter()

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Tidak ada pendaftaran yang menunggu persetujuan</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Tanggal Daftar</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isGoogleUser = user.accounts.some(a => a.provider === 'google')
            
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{user.email || '-'}</span>
                    {user.emailVerified && (
                      <Badge variant="outline" className="w-fit text-xs">
                        <Check className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.username}
                </TableCell>
                <TableCell>
                  <Badge variant={isGoogleUser ? "default" : "secondary"}>
                    {isGoogleUser ? 'Google' : 'Web'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), 'dd MMM yyyy HH:mm', { locale: localeId })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Setujui & Assign
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {selectedUser && (
        <ApproveUserDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        />
      )}
    </>
  )
}
