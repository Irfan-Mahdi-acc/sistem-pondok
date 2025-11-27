import { getUsers } from "@/actions/user-actions"
import UserTable from "@/components/users/user-table"
import { AddUserDialog } from "@/components/users/add-user-dialog"

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <AddUserDialog />
      </div>
      <UserTable users={users} />
    </div>
  )
}
