import { getExamById } from "@/actions/exam-actions"
import { ExamBuilder } from "@/components/exam/exam-builder"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export default async function ExamDetailPage({
  params
}: {
  params: Promise<{ lembagaId: string; examId: string }>
}) {
  const { lembagaId, examId } = await params
  const exam = await getExamById(examId)

  if (!exam) {
    notFound()
  }

  const examData = exam as any

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/academic/exams/${lembagaId}?mapelId=${examData.mapelId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{examData.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(examData.date), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
            </div>
            {examData.duration && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {examData.duration} menit
              </div>
            )}
            <div>
              {examData.mapel.name} - {examData.mapel.kelas.name}
            </div>
          </div>
        </div>
      </div>

      <ExamBuilder 
        exam={examData}
        mapelId={examData.mapelId}
      />
    </div>
  )
}
