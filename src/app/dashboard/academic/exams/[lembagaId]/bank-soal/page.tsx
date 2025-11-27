import { getMapelsByLembaga } from "@/actions/mapel-actions"
import { getQuestionCategories, getQuestionsByMapel } from "@/actions/question-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileDown } from "lucide-react"
import Link from "next/link"
import { QuestionBankTable } from "@/components/exam/question-bank-table"

export default async function BankSoalPage({
  params,
  searchParams
}: {
  params: Promise<{ lembagaId: string }>
  searchParams: Promise<{ mapelId?: string }>
}) {
  const { lembagaId } = await params
  const { mapelId } = await searchParams

  const mapels = await getMapelsByLembaga(lembagaId)
  const selectedMapelId = mapelId || mapels[0]?.id
  
  const questions = selectedMapelId ? await getQuestionsByMapel(selectedMapelId) : []
  const categories = selectedMapelId ? await getQuestionCategories(selectedMapelId) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Soal</h1>
          <p className="text-sm text-muted-foreground">
            Kelola bank soal untuk ujian
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/academic/exams/${lembagaId}`}>
            <Button variant="outline">
              Kembali ke Ujian
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
            {mapels.map((mapel) => (
              <Link 
                key={mapel.id} 
                href={`/dashboard/academic/exams/${lembagaId}/bank-soal?mapelId=${mapel.id}`}
              >
                <Card className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedMapelId === mapel.id ? 'border-primary bg-accent' : ''
                }`}>
                  <CardContent className="p-4">
                    <p className="font-medium">{mapel.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mapel.kelas.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedMapelId && (
        <QuestionBankTable 
          mapelId={selectedMapelId}
          mapelName={mapels.find(m => m.id === selectedMapelId)?.name || 'Mata Pelajaran'}
          questions={questions}
          categories={categories}
        />
      )}
    </div>
  )
}
