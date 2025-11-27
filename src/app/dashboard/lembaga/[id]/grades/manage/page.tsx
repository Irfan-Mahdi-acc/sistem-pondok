import { getLembagaCategories, getLembagaGroupNames } from "@/actions/lembaga-category-actions"
import { getLembagaById } from "@/actions/lembaga-actions"
import { CategoryManagement } from "@/components/lembaga/category-management"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ManageCategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [lembaga, categoriesData, existingGroups] = await Promise.all([
    getLembagaById(id),
    getLembagaCategories(id),
    getLembagaGroupNames(id)
  ])
  
  if (!lembaga) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/lembaga/${id}/grades`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Kelola Kategori Nilai</h1>
          <p className="text-muted-foreground">{lembaga.name}</p>
        </div>
      </div>

      <CategoryManagement
        lembagaId={id}
        categories={categoriesData.categories}
        grouped={categoriesData.grouped}
        existingGroups={existingGroups}
      />
    </div>
  )
}
