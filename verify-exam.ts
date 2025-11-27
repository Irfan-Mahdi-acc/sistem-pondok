
import { prisma } from "./src/lib/prisma"

async function main() {
  const examId = "cmibtu8rr00012ip8rtn0why3"
  console.log("Verifying exam:", examId)

  try {
    const exam = await prisma.ujian.findUnique({
      where: { id: examId },
      include: {
        mapel: {
          include: {
            kelas: {
              include: {
                lembaga: true
              }
            }
          }
        },
        questions: {
          include: {
            questionBank: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (exam) {
      console.log("Exam FOUND:", exam.name)
      console.log("Questions:", exam.questions.length)
    } else {
      console.log("Exam NOT FOUND")
    }
  } catch (e) {
    console.error("Error fetching exam:", e)
  }
}

main()
