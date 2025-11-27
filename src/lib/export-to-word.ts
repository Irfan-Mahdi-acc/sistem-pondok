
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, Header, Footer, PageNumber, NumberFormat } from "docx"
import { saveAs } from "file-saver"

interface QuestionOption {
  optionText: string
  isCorrect: boolean
}

interface Question {
  id: string
  question: string
  type: string
  options?: QuestionOption[] | string // string if JSON
  imageUrl?: string
  points: number
  itemType?: "QUESTION" | "SECTION_HEADER" | "INSTRUCTION"
}

interface ExportData {
  title: string
  subject: string
  className: string
  questions: Question[]
  includeAnswerKey?: boolean
  kopSurat?: {
    namaPondok: string
    alamat: string
    kontak: string
    logoUrl?: string // We might need to handle this carefully with docx
  }
}

export async function exportToWord(data: ExportData) {
  const { title, subject, className, questions, includeAnswerKey, kopSurat } = data

  // Helper to fetch image and convert to buffer
  const getImageBuffer = async (url: string): Promise<ArrayBuffer | null> => {
    try {
      const response = await fetch(url)
      return await response.arrayBuffer()
    } catch (error) {
      console.error("Failed to load image", url, error)
      return null
    }
  }

  // Create Header (Kop Surat)
  const headerChildren = []
  
  if (kopSurat) {
    headerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: kopSurat.namaPondok,
            bold: true,
            size: 28, // 14pt
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: kopSurat.alamat,
            size: 20, // 10pt
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: kopSurat.kontak,
            size: 20, // 10pt
          }),
        ],
      }),
      new Paragraph({
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [],
      }),
      new Paragraph({ children: [] }) // Spacer
    )
  }

  // Exam Details
  const detailsTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Mata Pelajaran", bold: true })] })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: `: ${subject}` })],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Kelas", bold: true })] })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: `: ${className}` })],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Ujian", bold: true })] })],
          }),
          new TableCell({
            children: [new Paragraph({ text: `: ${title}` })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Waktu", bold: true })] })],
          }),
          new TableCell({
            children: [new Paragraph({ text: ": ________________" })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Nama Santri", bold: true })] })],
          }),
          new TableCell({
            children: [new Paragraph({ text: ": _________________________________" })],
            columnSpan: 3,
          }),
        ],
      }),
    ],
  })

  // Questions
  const questionParagraphs: any[] = []
  let questionNumber = 1;
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    
    if (q.itemType === "SECTION_HEADER") {
      questionParagraphs.push(
        new Paragraph({
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: q.question,
              bold: true,
              size: 28, // 14pt
            }),
          ],
        })
      )
      continue;
    }

    if (q.itemType === "INSTRUCTION") {
      questionParagraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({
              text: q.question,
              italics: true,
            }),
          ],
        })
      )
      continue;
    }
    
    // Question Text
    const questionTextRuns = [
      new TextRun({
        text: `${questionNumber}. ${q.question}`,
        bold: true,
      }),
    ]
    
    questionParagraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: questionTextRuns,
      })
    )

    // Image
    if (q.imageUrl) {
      const imageBuffer = await getImageBuffer(q.imageUrl)
      if (imageBuffer) {
        questionParagraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 200,
                  height: 200,
                },
                type: "png", // Default to png
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 360 }, // Indent image slightly
          })
        )
      }
    }

    // Options
    let options: QuestionOption[] = []
    if (typeof q.options === 'string') {
      try {
        options = JSON.parse(q.options)
      } catch (e) {
        options = []
      }
    } else if (Array.isArray(q.options)) {
      options = q.options
    }

    if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
      options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx)
        questionParagraphs.push(
          new Paragraph({
            indent: { left: 720 }, // Indent options
            children: [
              new TextRun({
                text: `${letter}. ${opt.optionText}`,
              }),
            ],
          })
        )
      })
    } else if (q.type === "ESSAY") {
      questionParagraphs.push(
        new Paragraph({
          indent: { left: 720 },
          children: [
            new TextRun({
              text: "Jawaban: __________________________________________________________________",
            }),
          ],
        }),
        new Paragraph({
          indent: { left: 720 },
          children: [
            new TextRun({
              text: "___________________________________________________________________________",
            }),
          ],
        })
      )
    }
    
    questionNumber++;
  }

  // Answer Key Section
  const answerKeySection = []
  if (includeAnswerKey) {
    answerKeySection.push(
      new Paragraph({
        pageBreakBefore: true,
        heading: "Heading1",
        children: [new TextRun({ text: "Kunci Jawaban", bold: true })],
      })
    )

    let answerNumber = 1;
    questions.forEach((q, i) => {
      if (q.itemType === "SECTION_HEADER" || q.itemType === "INSTRUCTION") return;

      let answer = ""
      if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
        let options: QuestionOption[] = []
        if (typeof q.options === 'string') {
          try { options = JSON.parse(q.options) } catch (e) {}
        } else if (Array.isArray(q.options)) {
          options = q.options
        }
        
        const correctIdx = options.findIndex(o => o.isCorrect)
        if (correctIdx !== -1) {
          answer = String.fromCharCode(65 + correctIdx)
        }
      } else {
        answer = "Essay (Lihat kebijakan guru)"
      }

      answerKeySection.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${answerNumber}. ${answer}`,
            }),
          ],
        })
      )
      answerNumber++;
    })
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...headerChildren,
          detailsTable,
          new Paragraph({ text: "" }), // Spacer
          new Paragraph({ 
            children: [new TextRun({ text: "Soal Ujian", bold: true, size: 24 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          ...questionParagraphs,
          ...answerKeySection
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${title.replace(/\s+/g, '_')}_${subject.replace(/\s+/g, '_')}.docx`)
}
