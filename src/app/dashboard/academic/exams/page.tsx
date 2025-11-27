import { getLembagas } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AcademicExamsPage() {
  const lembagaList = await getLembagas()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exam Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Institution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose an institution to manage exams and grades
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lembagaList.map((lembaga) => (
              <Link key={lembaga.id} href={`/dashboard/academic/exams/${lembaga.id}`}>
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{lembaga.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {lembaga.jenjang || 'No level specified'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
