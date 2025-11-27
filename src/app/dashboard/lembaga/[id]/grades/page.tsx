import { getLembagaGradeInputDataByCategory } from "@/actions/lembaga-grade-actions-v2"
import { getLembagaCategories } from "@/actions/lembaga-category-actions"
import { getLembagaById } from "@/actions/lembaga-actions"
import { LembagaGradeInputTable } from "@/components/lembaga/lembaga-grade-input-table-v2"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Settings } from "lucide-react"

export default async function LembagaGradesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [lembaga, categoriesData] = await Promise.all([
    getLembagaById(id),
    getLembagaCategories(id)
  ])
  
  if (!lembaga) {
    notFound()
  }

  const { categories, grouped } = categoriesData

  // If no categories, show empty state
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nilai Non-Mata Pelajaran</h1>
          <p className="text-muted-foreground">
            {lembaga.name} - Input nilai untuk aspek non-akademik
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Belum Ada Kategori</CardTitle>
            <CardDescription>
              Anda belum membuat kategori penilaian untuk lembaga ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/lembaga/${id}/grades/manage`}>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Kelola Kategori
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch data for all categories
  const categoriesWithData = await Promise.all(
    categories.map(async (cat) => {
      const data = await getLembagaGradeInputDataByCategory(cat.id)
      return {
        ...cat,
        data
      }
    })
  )

  // Get group names
  const groupNames = Object.keys(grouped)
  const firstGroup = groupNames[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nilai Non-Mata Pelajaran</h1>
          <p className="text-muted-foreground">
            {lembaga.name} - Input nilai untuk aspek non-akademik
          </p>
        </div>
        <Link href={`/dashboard/lembaga/${id}/grades/manage`}>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Kelola Kategori
          </Button>
        </Link>
      </div>

      {/* Outer Tabs for Groups */}
      <Tabs defaultValue={firstGroup} className="space-y-4">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${groupNames.length}, 1fr)` }}>
          {groupNames.map((groupName) => (
            <TabsTrigger key={groupName} value={groupName}>
              {groupName === "Ungrouped" ? "Tanpa Group" : groupName}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content for each group */}
        {Object.entries(grouped).map(([groupName, cats]) => (
          <TabsContent key={groupName} value={groupName} className="space-y-4">
            {/* Inner Tabs for Categories within the group */}
            <Tabs defaultValue={cats[0].id} className="space-y-4">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${cats.length}, 1fr)` }}>
                {cats.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id}>
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Category content */}
              {cats.map((cat) => {
                const catWithData = categoriesWithData.find(c => c.id === cat.id)
                if (!catWithData) return null

                return (
                  <TabsContent key={cat.id} value={cat.id} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Input Nilai {cat.name}</CardTitle>
                        <CardDescription>
                          {cat.gradeType === "LETTER" 
                            ? "Gunakan nilai huruf A (terbaik) hingga E (terburuk)"
                            : "Masukkan nilai 0-100"
                          }
                          {cat.groupName && (
                            <span className="ml-2 text-xs">• Group: {cat.groupName}</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LembagaGradeInputTable
                          categoryId={cat.id}
                          categoryLabel={cat.name}
                          gradeType={cat.gradeType as "NUMERIC" | "LETTER"}
                          santriList={catWithData.data.santriList}
                        />
                      </CardContent>
                    </Card>

                    {cat.gradeType === "LETTER" && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Legenda Nilai</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-5 gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 dark:text-green-400 font-bold text-lg">A</span>
                              <span className="text-sm text-muted-foreground">Sangat Baik</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">B</span>
                              <span className="text-sm text-muted-foreground">Baik</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">C</span>
                              <span className="text-sm text-muted-foreground">Cukup</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">D</span>
                              <span className="text-sm text-muted-foreground">Kurang</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 dark:text-red-400 font-bold text-lg">E</span>
                              <span className="text-sm text-muted-foreground">Sangat Kurang</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

