"use client"

import { useEffect, useState } from "react"
import { getLembagaCategories } from "@/actions/lembaga-category-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryManagementDialog } from "./category-management-dialog"
import { KelasListForNonMapel } from "./kelas-list-for-non-mapel"

interface NilaiNonMapelTabProps {
  lembagaId: string
  academicYearId: string
  semester: string
}

export function NilaiNonMapelTab({ lembagaId, academicYearId, semester }: NilaiNonMapelTabProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [grouped, setGrouped] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        const data = await getLembagaCategories(lembagaId)
        setCategories(data.categories)
        setGrouped(data.grouped)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [lembagaId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nilai Non-Mapel</CardTitle>
              <div className="text-sm text-muted-foreground">
                Semester {semester}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nilai Non-Mapel</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Semester {semester}
              </div>
            </div>
            <CategoryManagementDialog lembagaId={lembagaId} categories={categories} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pilih kelas untuk input nilai per santri, atau pilih kategori untuk input per kategori
          </p>

          {/* Class-based Input Section */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Input per Kelas (Semua Kategori Sekaligus)
            </h3>
            <KelasListForNonMapel lembagaId={lembagaId} academicYearId={academicYearId} semester={semester} />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Input per Kategori</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pilih kategori untuk input nilai sikap, kepribadian, dan kategori lainnya
            </p>

            {categories.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">Belum ada kategori nilai non-mapel</p>
                <Link href={`/dashboard/lembaga/${lembagaId}`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Kategori
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([groupName, items]) => (
                  <div key={groupName}>
                    <h3 className="font-semibold mb-3">{groupName}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((category: any) => (
                        <Link 
                          key={category.id} 
                          href={`/dashboard/academic/nilai-raport/${lembagaId}/non-mapel/${category.id}?academicYearId=${academicYearId}&semester=${semester}`}
                        >
                          <Card className="hover:bg-accent cursor-pointer transition-colors">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                <Badge variant="outline">
                                  {category.gradeType === "NUMERIC" ? "0-100" : "A-E"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                {category._count?.nilais || 0} nilai tersimpan
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
