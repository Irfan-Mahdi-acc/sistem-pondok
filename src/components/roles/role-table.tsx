'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteRole } from "@/actions/role-actions"
import { Badge } from "@/components/ui/badge"

export default function RoleTable({ roles }: { roles: any[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((rp: any) => (
                    <Badge key={rp.id} variant="secondary">
                      {rp.permission.resource}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <form action={async () => {
                  if (confirm('Are you sure?')) {
                    await deleteRole(role.id)
                  }
                }}>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
