import { getRoles } from "@/actions/role-actions"
import RoleTable from "@/components/roles/role-table"
import { AddRoleDialog } from "@/components/roles/add-role-dialog"

export default async function RolesPage() {
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <AddRoleDialog />
      </div>
      <RoleTable roles={roles} />
    </div>
  )
}
