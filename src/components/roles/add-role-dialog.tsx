'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createRole } from "@/actions/role-actions"
import { useState } from "react"
import { AVAILABLE_PERMISSIONS } from "@/lib/permissions"

export function AddRoleDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await createRole(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Role</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Role Name
            </Label>
            <Input id="name" name="name" className="col-span-3" required />
          </div>
          <div className="grid gap-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <div key={perm.id} className="flex items-center space-x-2">
                  <Checkbox id={perm.id} name="permissions" value={perm.id} />
                  <Label htmlFor={perm.id} className="text-sm font-normal">
                    {perm.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
