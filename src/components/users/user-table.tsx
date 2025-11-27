'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Trash2, Pencil } from "lucide-react"
import { deleteUser, updateUser } from "@/actions/user-actions"
import { EditUserDialog } from "./edit-user-dialog"

export default function UserTable({ users }: { users: any[] }) {
  const router = useRouter()
  const [editingUser, setEditingUser] = useState<any>(null)

  const handleSaveUser = async (userId: string, data: { name: string; username: string; roles: string[]; password?: string }) => {
    console.log('Saving user with roles:', data.roles)
    const result = await updateUser(userId, data)
    if (!result.success) {
      throw new Error(result.error)
    }
    router.refresh()
  }

  const getRoles = (user: any) => {
    try {
      return user.roles ? JSON.parse(user.roles) : [user.role]
    } catch {
      return [user.role]
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {getRoles(user).map((role: string) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <form action={async () => {
                      if (confirm('Are you sure?')) {
                        await deleteUser(user.id)
                      }
                    }}>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
          onSave={handleSaveUser}
        />
      )}
    </>
  )
}
