'use client'

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Helper function to get predicate from score
function getGradePredicate(score: number): string {
  if (score >= 9) return 'A'
  if (score >= 8) return 'B'
  if (score >= 7) return 'C'
  if (score >= 6) return 'D'
  return 'E'
}

// Helper function to set column widths
function setColumnWidths(worksheet: XLSX.WorkSheet, widths: number[]) {
  worksheet['!cols'] = widths.map(w => ({ wch: w }))
}

// Helper function to style header cells
function styleHeader(worksheet: XLSX.WorkSheet, range: string, bgColor: string = 'FF4472C4') {
  const decode = XLSX.utils.decode_range(range)
  
  for (let R = decode.s.r; R <= decode.e.r; ++R) {
    for (let C = decode.s.c; C <= decode.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (!worksheet[cellAddress]) continue
      
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: bgColor } },
        font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: 'FF000000' } },
          bottom: { style: 'thin', color: { rgb: 'FF000000' } },
          left: { style: 'thin', color: { rgb: 'FF000000' } },
          right: { style: 'thin', color: { rgb: 'FF000000' } }
        }
      }
    }
  }
}

// Helper function to apply borders to all cells
function applyBorders(worksheet: XLSX.WorkSheet, range: string) {
  const decode = XLSX.utils.decode_range(range)
  
  for (let R = decode.s.r; R <= decode.e.r; ++R) {
    for (let C = decode.s.c; C <= decode.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (!worksheet[cellAddress]) continue
      
      if (!worksheet[cellAddress].s) {
        worksheet[cellAddress].s = {}
      }
      
      worksheet[cellAddress].s.border = {
        top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
      }
    }
  }
}

// Helper to apply conditional formatting to score cells
function applyConditionalFormatting(worksheet: XLSX.WorkSheet, cellAddress: string, score: number) {
  if (!worksheet[cellAddress]) return
  
  let bgColor = 'FFFFFFFF'
  if (score >= 9) bgColor = 'FF92D050' // Green
  else if (score >= 8) bgColor = 'FF00B0F0' // Blue
  else if (score >= 7) bgColor = 'FFFFFF00' // Yellow
  else if (score >= 6) bgColor = 'FFFFC000' // Orange
  else if (score > 0) bgColor = 'FFFF0000' // Red
  
  worksheet[cellAddress].s = {
    fill: { fgColor: { rgb: bgColor } },
    font: { bold: true, sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
    }
  }
}

// Export raport data to Excel with enhanced styling
export function exportRaportToExcel(
  kelasName: string,
  semester: string,
  students: any[],
  nilaiData: any[],
  ujianHifdzData: any[],
  categories: any[]
) {
  const workbook = XLSX.utils.book_new()
  const now = new Date()

  // ============================================
  // SHEET 1: RINGKASAN / SUMMARY
  // ============================================
  const summaryData: any[] = []
  
  // Header Info
  summaryData.push(['LAPORAN RAPORT KELAS'])
  summaryData.push([])
  summaryData.push(['Kelas:', kelasName])
  summaryData.push(['Semester:', semester])
  summaryData.push(['Tanggal Cetak:', now.toLocaleDateString('id-ID')])
  summaryData.push(['Total Santri:', students.length])
  summaryData.push([])
  
  // Calculate class statistics
  const classStats = students.map(student => {
    const studentNilai = nilaiData.filter(n => n.santriId === student.id)
    const mapelNilai = studentNilai.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
    const scores = mapelNilai.filter(n => n.score).map(n => n.score)
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    
    return {
      nis: student.nis,
      nama: student.nama,
      average,
      predicate: getGradePredicate(average)
    }
  }).sort((a, b) => b.average - a.average)
  
  const classAverage = classStats.reduce((sum, s) => sum + s.average, 0) / classStats.length
  const highestScore = Math.max(...classStats.map(s => s.average))
  const lowestScore = Math.min(...classStats.map(s => s.average))
  
  summaryData.push(['STATISTIK KELAS'])
  summaryData.push(['Rata-rata Kelas:', classAverage.toFixed(2)])
  summaryData.push(['Nilai Tertinggi:', highestScore.toFixed(2)])
  summaryData.push(['Nilai Terendah:', lowestScore.toFixed(2)])
  summaryData.push([])
  
  // Predicate distribution
  const predicateCount = {
    A: classStats.filter(s => s.predicate === 'A').length,
    B: classStats.filter(s => s.predicate === 'B').length,
    C: classStats.filter(s => s.predicate === 'C').length,
    D: classStats.filter(s => s.predicate === 'D').length,
    E: classStats.filter(s => s.predicate === 'E').length,
  }
  
  summaryData.push(['DISTRIBUSI PREDIKAT'])
  summaryData.push(['Predikat A (≥9.0):', predicateCount.A, `${((predicateCount.A/students.length)*100).toFixed(1)}%`])
  summaryData.push(['Predikat B (8.0-8.9):', predicateCount.B, `${((predicateCount.B/students.length)*100).toFixed(1)}%`])
  summaryData.push(['Predikat C (7.0-7.9):', predicateCount.C, `${((predicateCount.C/students.length)*100).toFixed(1)}%`])
  summaryData.push(['Predikat D (6.0-6.9):', predicateCount.D, `${((predicateCount.D/students.length)*100).toFixed(1)}%`])
  summaryData.push(['Predikat E (<6.0):', predicateCount.E, `${((predicateCount.E/students.length)*100).toFixed(1)}%`])
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  setColumnWidths(summarySheet, [25, 20, 15])
  
  // Style summary sheet
  if (summarySheet['A1']) {
    summarySheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: 'FF4472C4' } },
      alignment: { horizontal: 'center' }
    }
  }
  
  // Merge title cell
  summarySheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
  ]
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Ringkasan')

  // ============================================
  // SHEET 2: RANKING
  // ============================================
  const rankingData: any[] = []
  rankingData.push(['RANKING KELAS'])
  rankingData.push([])
  rankingData.push(['Ranking', 'NIS', 'Nama Santri', 'Rata-rata', 'Predikat'])
  
  classStats.forEach((student, index) => {
    rankingData.push([
      index + 1,
      student.nis,
      student.nama,
      parseFloat(student.average.toFixed(2)),
      student.predicate
    ])
  })
  
  const rankingSheet = XLSX.utils.aoa_to_sheet(rankingData)
  setColumnWidths(rankingSheet, [10, 15, 30, 12, 10])
  
  // Freeze panes (header row)
  rankingSheet['!freeze'] = { xSplit: 0, ySplit: 3 }
  
  // Style header
  styleHeader(rankingSheet, 'A3:E3')
  
  // Apply conditional formatting to scores
  for (let i = 0; i < classStats.length; i++) {
    const cellAddress = `D${i + 4}`
    applyConditionalFormatting(rankingSheet, cellAddress, classStats[i].average)
  }
  
  XLSX.utils.book_append_sheet(workbook, rankingSheet, '🏆 Ranking')

  // ============================================
  // SHEET 3: NILAI MAPEL (DETAILED)
  // ============================================
  
  // Get all unique mapel names
  const allMapelNames = [...new Set(
    nilaiData
      .filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
      .map(n => n.mapel?.name)
      .filter(Boolean)
  )]
  
  const mapelDataDetailed: any[] = []
  
  // Header rows
  mapelDataDetailed.push(['NILAI MATA PELAJARAN - DETAIL'])
  mapelDataDetailed.push([])
  
  // Column headers
  const mapelHeaders = ['No', 'NIS', 'Nama Santri', ...allMapelNames, 'Rata-rata', 'Predikat', 'Ranking']
  mapelDataDetailed.push(mapelHeaders)
  
  // Data rows with ranking
  classStats.forEach((rankedStudent, index) => {
    const student = students.find(s => s.nis === rankedStudent.nis)
    if (!student) return
    
    const studentNilai = nilaiData.filter(n => n.santriId === student.id)
    const mapelNilai = studentNilai.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
    
    const row: any[] = [
      index + 1,
      student.nis,
      student.nama
    ]
    
    // Add scores for each mapel
    allMapelNames.forEach(mapelName => {
      const nilaiForMapel = mapelNilai.filter(n => n.mapel?.name === mapelName)
      if (nilaiForMapel.length > 0) {
        const avgScore = nilaiForMapel.reduce((sum, n) => sum + (n.score || 0), 0) / nilaiForMapel.length
        row.push(parseFloat(avgScore.toFixed(2)))
      } else {
        row.push('-')
      }
    })
    
    // Add average, predicate, and ranking
    row.push(
      parseFloat(rankedStudent.average.toFixed(2)),
      rankedStudent.predicate,
      index + 1
    )
    
    mapelDataDetailed.push(row)
  })
  
  // Add class average row
  const avgRow: any[] = ['', '', 'RATA-RATA KELAS']
  allMapelNames.forEach(mapelName => {
    const allScoresForMapel = nilaiData
      .filter(n => (n.category === 'UJIAN' || n.category === 'TUGAS') && n.mapel?.name === mapelName && n.score)
      .map(n => n.score)
    
    if (allScoresForMapel.length > 0) {
      const avg = allScoresForMapel.reduce((a, b) => a + b, 0) / allScoresForMapel.length
      avgRow.push(parseFloat(avg.toFixed(2)))
    } else {
      avgRow.push('-')
    }
  })
  avgRow.push(parseFloat(classAverage.toFixed(2)), '', '')
  mapelDataDetailed.push(avgRow)
  
  const mapelSheet = XLSX.utils.aoa_to_sheet(mapelDataDetailed)
  
  // Set column widths
  const mapelColWidths = [5, 15, 30, ...allMapelNames.map(() => 12), 12, 10, 10]
  setColumnWidths(mapelSheet, mapelColWidths)
  
  // Freeze panes
  mapelSheet['!freeze'] = { xSplit: 3, ySplit: 3 }
  
  // Style header
  const lastMapelCol = String.fromCharCode(65 + mapelHeaders.length - 1)
  styleHeader(mapelSheet, `A3:${lastMapelCol}3`, 'FF4472C4')
  
  // Apply conditional formatting
  for (let i = 0; i < classStats.length; i++) {
    for (let j = 0; j < allMapelNames.length; j++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i + 3, c: j + 3 })
      const cellValue = mapelSheet[cellAddress]?.v
      if (typeof cellValue === 'number') {
        applyConditionalFormatting(mapelSheet, cellAddress, cellValue)
      }
    }
    
    // Average column
    const avgCol = allMapelNames.length + 3
    const avgCellAddress = XLSX.utils.encode_cell({ r: i + 3, c: avgCol })
    applyConditionalFormatting(mapelSheet, avgCellAddress, classStats[i].average)
  }
  
  // Merge title
  mapelSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: mapelHeaders.length - 1 } }
  ]
  
  XLSX.utils.book_append_sheet(workbook, mapelSheet, '📚 Nilai Mapel')

  // ============================================
  // SHEET 4: NILAI NON-MAPEL
  // ============================================
  const nonMapelData: any[] = []
  nonMapelData.push(['NILAI NON-MAPEL (SIKAP & KEPRIBADIAN)'])
  nonMapelData.push([])
  
  // Group categories by groupName
  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.groupName || 'Lainnya'
    if (!acc[group]) acc[group] = []
    acc[group].push(cat)
    return acc
  }, {} as Record<string, any[]>)
  
  const nonMapelHeaders = ['No', 'NIS', 'Nama Santri']
  Object.entries(groupedCategories).forEach(([groupName, cats]) => {
    (cats as any[]).forEach((cat: any) => {
      nonMapelHeaders.push(`${cat.name} (${groupName})`)
    })
  })
  nonMapelData.push(nonMapelHeaders)
  
  students.forEach((student, index) => {
    const studentNilai = nilaiData.filter(n => n.santriId === student.id && n.category === 'NON_MAPEL')
    
    const row: any[] = [index + 1, student.nis, student.nama]
    
    Object.entries(groupedCategories).forEach(([_, cats]) => {
      (cats as any[]).forEach((cat: any) => {
        const nilai = studentNilai.find(n => n.categoryId === cat.id)
        if (nilai) {
          row.push(nilai.gradeType === 'NUMERIC' ? nilai.score : nilai.letterGrade || '-')
        } else {
          row.push('-')
        }
      })
    })
    
    nonMapelData.push(row)
  })
  
  const nonMapelSheet = XLSX.utils.aoa_to_sheet(nonMapelData)
  
  const nonMapelColWidths = [5, 15, 30, ...Object.values(groupedCategories).flat().map(() => 15)]
  setColumnWidths(nonMapelSheet, nonMapelColWidths)
  
  nonMapelSheet['!freeze'] = { xSplit: 3, ySplit: 3 }
  
  const lastNonMapelCol = String.fromCharCode(65 + nonMapelHeaders.length - 1)
  styleHeader(nonMapelSheet, `A3:${lastNonMapelCol}3`, 'FF70AD47')
  
  nonMapelSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: nonMapelHeaders.length - 1 } }
  ]
  
  XLSX.utils.book_append_sheet(workbook, nonMapelSheet, '📋 Nilai Non-Mapel')

  // ============================================
  // SHEET 5: NILAI TAHFIDZ
  // ============================================
  const hifdzData: any[] = []
  hifdzData.push(['CAPAIAN TAHFIDZ'])
  hifdzData.push([])
  hifdzData.push(['No', 'NIS', 'Nama Santri', 'Surah', 'Ayat Mulai', 'Ayat Selesai', 'Total Ayat', 'Nilai', 'Keterangan'])
  
  let hifdzRowNumber = 1
  students.forEach(student => {
    const studentHifdz = ujianHifdzData.filter(h => h.santriId === student.id)
    
    if (studentHifdz.length > 0) {
      studentHifdz.forEach(hifdz => {
        const totalAyat = hifdz.ayatEnd - hifdz.ayatStart + 1
        hifdzData.push([
          hifdzRowNumber++,
          student.nis,
          student.nama,
          hifdz.surah,
          hifdz.ayatStart,
          hifdz.ayatEnd,
          totalAyat,
          hifdz.grade || '-',
          hifdz.note || '-'
        ])
      })
    }
  })
  
  // Add summary
  const totalUjian = ujianHifdzData.length
  const totalAyatAll = ujianHifdzData.reduce((sum, h) => sum + (h.ayatEnd - h.ayatStart + 1), 0)
  const avgGrade = ujianHifdzData.length > 0 
    ? ujianHifdzData.reduce((sum, h) => sum + (parseFloat(h.grade) || 0), 0) / ujianHifdzData.length 
    : 0
  
  hifdzData.push([])
  hifdzData.push(['RINGKASAN'])
  hifdzData.push(['Total Ujian Hifdz:', totalUjian])
  hifdzData.push(['Total Ayat Dihafalkan:', totalAyatAll])
  hifdzData.push(['Rata-rata Nilai:', avgGrade.toFixed(2)])
  
  const hifdzSheet = XLSX.utils.aoa_to_sheet(hifdzData)
  setColumnWidths(hifdzSheet, [5, 15, 30, 20, 12, 12, 12, 10, 35])
  
  hifdzSheet['!freeze'] = { xSplit: 0, ySplit: 3 }
  
  styleHeader(hifdzSheet, 'A3:I3', 'FFF4B084')
  
  hifdzSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }
  ]
  
  XLSX.utils.book_append_sheet(workbook, hifdzSheet, '📖 Tahfidz')

  // ============================================
  // SHEET 6: PER MAPEL ANALYSIS
  // ============================================
  const mapelAnalysisData: any[] = []
  mapelAnalysisData.push(['ANALISIS PER MATA PELAJARAN'])
  mapelAnalysisData.push([])
  mapelAnalysisData.push(['Mata Pelajaran', 'Rata-rata', 'Tertinggi', 'Terendah', 'Jumlah Nilai', 'Standar Deviasi'])
  
  allMapelNames.forEach(mapelName => {
    const allScoresForMapel = nilaiData
      .filter(n => (n.category === 'UJIAN' || n.category === 'TUGAS') && n.mapel?.name === mapelName && n.score)
      .map(n => n.score)
    
    if (allScoresForMapel.length > 0) {
      const avg = allScoresForMapel.reduce((a, b) => a + b, 0) / allScoresForMapel.length
      const max = Math.max(...allScoresForMapel)
      const min = Math.min(...allScoresForMapel)
      
      // Calculate standard deviation
      const variance = allScoresForMapel.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / allScoresForMapel.length
      const stdDev = Math.sqrt(variance)
      
      mapelAnalysisData.push([
        mapelName,
        parseFloat(avg.toFixed(2)),
        max,
        min,
        allScoresForMapel.length,
        parseFloat(stdDev.toFixed(2))
      ])
    }
  })
  
  const mapelAnalysisSheet = XLSX.utils.aoa_to_sheet(mapelAnalysisData)
  setColumnWidths(mapelAnalysisSheet, [30, 12, 12, 12, 15, 18])
  
  styleHeader(mapelAnalysisSheet, 'A3:F3', 'FF5B9BD5')
  
  mapelAnalysisSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
  ]
  
  XLSX.utils.book_append_sheet(workbook, mapelAnalysisSheet, '📈 Analisis Mapel')

  // Download file
  const fileName = `Raport_${kelasName}_Semester_${semester}_${now.toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName, { 
    bookType: 'xlsx',
    cellStyles: true 
  })
}

// Generate PDF for single student
export function generateStudentPDF(
  student: any,
  kelasName: string,
  semester: string,
  nilaiData: any[],
  ujianHifdzData: any[],
  categories: any[]
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RAPORT SANTRI', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Kelas: ${kelasName}`, 20, 30)
  doc.text(`Semester: ${semester}`, 20, 35)

  // Student Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Nama: ${student.nama}`, 20, 45)
  doc.setFont('helvetica', 'normal')
  doc.text(`NIS: ${student.nis}`, 20, 50)

  let yPos = 60

  // Nilai Mapel
  const mapelNilai = nilaiData.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
  if (mapelNilai.length > 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Nilai Mata Pelajaran', 20, yPos)
    yPos += 5

    const mapelRows = mapelNilai.map(n => [
      n.mapel?.name || '-',
      n.score?.toString() || '-',
      n.category
    ])

    const mapelAvg = mapelNilai.filter(n => n.score).length > 0
      ? (mapelNilai.filter(n => n.score).reduce((sum, n) => sum + n.score, 0) / mapelNilai.filter(n => n.score).length).toFixed(2)
      : '-'

    autoTable(doc, {
      startY: yPos,
      head: [['Mata Pelajaran', 'Nilai', 'Kategori']],
      body: mapelRows,
      foot: [['Rata-rata', mapelAvg, '']],
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Nilai Non-Mapel
  const nonMapelNilai = nilaiData.filter(n => n.category === 'NON_MAPEL')
  if (nonMapelNilai.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Nilai Non-Mapel', 20, yPos)
    yPos += 5

    const nonMapelRows = nonMapelNilai.map(n => {
      const category = categories.find(c => c.id === n.categoryId)
      return [
        category?.name || '-',
        n.gradeType === 'NUMERIC' ? n.score?.toString() : n.letterGrade || '-'
      ]
    })

    autoTable(doc, {
      startY: yPos,
      head: [['Kategori', 'Nilai']],
      body: nonMapelRows,
      theme: 'grid',
      headStyles: { fillColor: [92, 184, 92] }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Nilai Tahfidz - Ujian Hifdz
  if (ujianHifdzData.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Nilai Tahfidz', 20, yPos)
    yPos += 5

    const hifdzRows = ujianHifdzData.map(h => [
      h.surah,
      `${h.ayatStart} - ${h.ayatEnd}`,
      h.grade || '-',
      h.note || '-'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Surah', 'Ayat', 'Nilai', 'Keterangan']],
      body: hifdzRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 173, 78] }
    })
  }

  // Download
  const fileName = `Raport_${student.nama}_${kelasName}_Sem${semester}.pdf`
  doc.save(fileName)
}

// Generate batch PDF for all students
export async function generateBatchPDF(
  students: any[],
  kelasName: string,
  semester: string,
  nilaiData: any[],
  ujianHifdzData: any[],
  categories: any[],
  onProgress?: (current: number, total: number) => void
) {
  const doc = new jsPDF()
  let isFirstStudent = true

  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    
    if (onProgress) {
      onProgress(i + 1, students.length)
    }

    if (!isFirstStudent) {
      doc.addPage()
    }
    isFirstStudent = false

    const studentNilai = nilaiData.filter(n => n.santriId === student.id)
    const studentHifdz = ujianHifdzData.filter(h => h.santriId === student.id)

    // Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('RAPORT SANTRI', 105, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Kelas: ${kelasName}`, 20, 30)
    doc.text(`Semester: ${semester}`, 20, 35)

    // Student Info
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Nama: ${student.nama}`, 20, 45)
    doc.setFont('helvetica', 'normal')
    doc.text(`NIS: ${student.nis}`, 20, 50)

    let yPos = 60

    // Nilai Mapel
    const mapelNilai = studentNilai.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
    if (mapelNilai.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Nilai Mata Pelajaran', 20, yPos)
      yPos += 5

      const mapelRows = mapelNilai.map(n => [
        n.mapel?.name || '-',
        n.score?.toString() || '-',
        n.category
      ])

      const mapelAvg = mapelNilai.filter(n => n.score).length > 0
        ? (mapelNilai.filter(n => n.score).reduce((sum, n) => sum + n.score, 0) / mapelNilai.filter(n => n.score).length).toFixed(2)
        : '-'

      autoTable(doc, {
        startY: yPos,
        head: [['Mata Pelajaran', 'Nilai', 'Kategori']],
        body: mapelRows,
        foot: [['Rata-rata', mapelAvg, '']],
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' }
      })

      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // Nilai Non-Mapel
    const nonMapelNilai = studentNilai.filter(n => n.category === 'NON_MAPEL')
    if (nonMapelNilai.length > 0) {
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Nilai Non-Mapel', 20, yPos)
      yPos += 5

      const nonMapelRows = nonMapelNilai.map(n => {
        const category = categories.find(c => c.id === n.categoryId)
        return [
          category?.name || '-',
          n.gradeType === 'NUMERIC' ? n.score?.toString() : n.letterGrade || '-'
        ]
      })

      autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Nilai']],
        body: nonMapelRows,
        theme: 'grid',
        headStyles: { fillColor: [92, 184, 92] }
      })

      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // Nilai Tahfidz - Ujian Hifdz
    if (studentHifdz.length > 0) {
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Nilai Tahfidz', 20, yPos)
      yPos += 5

      const hifdzRows = studentHifdz.map(h => [
        h.surah,
        `${h.ayatStart} - ${h.ayatEnd}`,
        h.grade || '-',
        h.note || '-'
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['Surah', 'Ayat', 'Nilai', 'Keterangan']],
        body: hifdzRows,
        theme: 'grid',
        headStyles: { fillColor: [240, 173, 78] }
      })
    }
  }

  // Download
  const fileName = `Raport_${kelasName}_Semester${semester}_Semua.pdf`
  doc.save(fileName)
}
