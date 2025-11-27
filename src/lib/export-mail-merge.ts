'use client'

import * as XLSX from 'xlsx'

// Helper function to get predicate from score
function getGradePredicate(score: number): string {
  if (score >= 9) return 'A'
  if (score >= 8) return 'B'
  if (score >= 7) return 'C'
  if (score >= 6) return 'D'
  return 'E'
}

function getPredicateDescription(predicate: string): string {
  switch (predicate) {
    case 'A': return 'Sangat Baik'
    case 'B': return 'Baik'
    case 'C': return 'Cukup'
    case 'D': return 'Kurang'
    case 'E': return 'Sangat Kurang'
    default: return '-'
  }
}

// Format number to 2 decimal places
function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-'
  return num.toFixed(2)
}

/**
 * Export raport data untuk Mail Merge ke Word
 * Format: Satu row per santri dengan SEMUA data dalam satu row
 * Cocok untuk template Word raport
 */
export function exportRaportForMailMerge(
  kelasName: string,
  semester: string,
  academicYear: string,
  lembagaName: string,
  students: any[],
  nilaiData: any[],
  ujianHifdzData: any[],
  categories: any[]
) {
  const mailMergeData: any[] = []

  // Get all unique mapel names untuk column headers
  const allMapelNames = [...new Set(
    nilaiData
      .filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
      .map(n => n.mapel?.name)
      .filter(Boolean)
  )].sort()

  // Get all unique category names untuk non-mapel
  const allCategoryNames = categories.map(c => c.name).sort()

  // Calculate ranking
  const studentsWithRanking = students.map(student => {
    const studentNilai = nilaiData.filter(n => n.santriId === student.id)
    const mapelNilai = studentNilai.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
    const scores = mapelNilai.filter(n => n.score).map(n => n.score)
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    
    return {
      student,
      average,
      predicate: getGradePredicate(average)
    }
  }).sort((a, b) => b.average - a.average)

  // Process each student
  studentsWithRanking.forEach((item, index) => {
    const { student } = item
    const studentNilai = nilaiData.filter(n => n.santriId === student.id)
    const mapelNilai = studentNilai.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
    const nonMapelNilai = studentNilai.filter(n => n.category === 'NON_MAPEL')
    const studentHifdz = ujianHifdzData.filter(h => h.santriId === student.id)
    
    const ranking = index + 1
    const raportNumber = `${academicYear}-${semester}-${lembagaName.substring(0, 3).toUpperCase()}-${ranking.toString().padStart(3, '0')}`

    // Base student info
    const row: any = {
      // METADATA
      'Nomor_Raport': raportNumber,
      'Tanggal_Cetak': new Date().toLocaleDateString('id-ID'),
      'Tahun_Akademik': academicYear,
      'Semester': semester,
      'Kelas': kelasName,
      'Lembaga': lembagaName,
      
      // IDENTITAS SANTRI
      'NIS': student.nis,
      'NISN': student.nisn || '-',
      'Nama_Lengkap': student.nama,
      'Jenis_Kelamin': student.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tempat_Lahir': student.birthPlace || '-',
      'Tanggal_Lahir': student.birthDate ? new Date(student.birthDate).toLocaleDateString('id-ID') : '-',
      'Alamat': student.address || '-',
      
      // DATA WALI
      'Nama_Ayah': student.fatherName || '-',
      'Pekerjaan_Ayah': student.fatherJob || '-',
      'Nama_Ibu': student.motherName || '-',
      'Pekerjaan_Ibu': student.motherJob || '-',
      'Nama_Wali': student.waliName || '-',
      'Hubungan_Wali': student.waliRelation || '-',
      
      // RANKING & PRESTASI
      'Ranking': ranking,
      'Total_Santri': students.length,
      'Ranking_Text': `${ranking} dari ${students.length}`,
      'Rata_Rata_Keseluruhan': formatNumber(item.average),
      'Predikat_Keseluruhan': item.predicate,
      'Deskripsi_Predikat': getPredicateDescription(item.predicate),
    }

    // NILAI MAPEL - Satu kolom per mapel
    allMapelNames.forEach(mapelName => {
      const nilaiForMapel = mapelNilai.filter(n => n.mapel?.name === mapelName)
      
      if (nilaiForMapel.length > 0) {
        const scores = nilaiForMapel.filter(n => n.score).map(n => n.score)
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        const predicate = getGradePredicate(avgScore)
        
        // Clean mapel name untuk column name (replace spaces dengan underscore)
        const cleanMapelName = mapelName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
        
        row[`Mapel_${cleanMapelName}_Nilai`] = formatNumber(avgScore)
        row[`Mapel_${cleanMapelName}_Predikat`] = predicate
        row[`Mapel_${cleanMapelName}_Deskripsi`] = getPredicateDescription(predicate)
        
        // Detail per jenis ujian (opsional, bisa di-uncomment jika perlu)
        nilaiForMapel.forEach((nilai, idx) => {
          const jenisUjian = nilai.ujian?.name || nilai.category
          const cleanJenisName = jenisUjian.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
          row[`Mapel_${cleanMapelName}_${cleanJenisName}`] = nilai.score || '-'
        })
      } else {
        const cleanMapelName = mapelName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
        row[`Mapel_${cleanMapelName}_Nilai`] = '-'
        row[`Mapel_${cleanMapelName}_Predikat`] = '-'
        row[`Mapel_${cleanMapelName}_Deskripsi`] = '-'
      }
    })

    // NILAI NON-MAPEL (Sikap & Kepribadian)
    allCategoryNames.forEach(categoryName => {
      const category = categories.find(c => c.name === categoryName)
      const nilai = nonMapelNilai.find(n => n.categoryId === category?.id)
      
      const cleanCategoryName = categoryName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
      const groupName = category?.groupName || 'Umum'
      
      if (nilai) {
        const nilaiValue = nilai.gradeType === 'NUMERIC' ? nilai.score : nilai.letterGrade || '-'
        row[`NonMapel_${cleanCategoryName}`] = nilaiValue
        row[`NonMapel_${cleanCategoryName}_Kelompok`] = groupName
      } else {
        row[`NonMapel_${cleanCategoryName}`] = '-'
        row[`NonMapel_${cleanCategoryName}_Kelompok`] = groupName
      }
    })

    // TAHFIDZ - Summary
    if (studentHifdz.length > 0) {
      const totalAyat = studentHifdz.reduce((sum, h) => sum + (h.ayatEnd - h.ayatStart + 1), 0)
      const avgGrade = studentHifdz.reduce((sum, h) => sum + (parseFloat(h.grade) || 0), 0) / studentHifdz.length
      
      row['Tahfidz_Total_Ujian'] = studentHifdz.length
      row['Tahfidz_Total_Ayat'] = totalAyat
      row['Tahfidz_Rata_Rata'] = formatNumber(avgGrade)
      row['Tahfidz_Predikat'] = getGradePredicate(avgGrade)
      
      // List surah yang dihafalkan (comma separated)
      const surahList = [...new Set(studentHifdz.map(h => h.surah))].join(', ')
      row['Tahfidz_Surah'] = surahList
      
      // Detail 5 ujian terakhir (untuk ditampilkan di raport)
      const recentHifdz = studentHifdz.slice(0, 5)
      recentHifdz.forEach((hifdz, idx) => {
        row[`Tahfidz_${idx + 1}_Surah`] = hifdz.surah
        row[`Tahfidz_${idx + 1}_Ayat`] = `${hifdz.ayatStart}-${hifdz.ayatEnd}`
        row[`Tahfidz_${idx + 1}_Total_Ayat`] = hifdz.ayatEnd - hifdz.ayatStart + 1
        row[`Tahfidz_${idx + 1}_Nilai`] = hifdz.grade || '-'
        row[`Tahfidz_${idx + 1}_Keterangan`] = hifdz.note || '-'
      })
      
      // Fill empty slots if less than 5
      for (let i = recentHifdz.length + 1; i <= 5; i++) {
        row[`Tahfidz_${i}_Surah`] = '-'
        row[`Tahfidz_${i}_Ayat`] = '-'
        row[`Tahfidz_${i}_Total_Ayat`] = '-'
        row[`Tahfidz_${i}_Nilai`] = '-'
        row[`Tahfidz_${i}_Keterangan`] = '-'
      }
    } else {
      row['Tahfidz_Total_Ujian'] = 0
      row['Tahfidz_Total_Ayat'] = 0
      row['Tahfidz_Rata_Rata'] = '-'
      row['Tahfidz_Predikat'] = '-'
      row['Tahfidz_Surah'] = '-'
      
      for (let i = 1; i <= 5; i++) {
        row[`Tahfidz_${i}_Surah`] = '-'
        row[`Tahfidz_${i}_Ayat`] = '-'
        row[`Tahfidz_${i}_Total_Ayat`] = '-'
        row[`Tahfidz_${i}_Nilai`] = '-'
        row[`Tahfidz_${i}_Keterangan`] = '-'
      }
    }

    // CATATAN & REKOMENDASI (placeholder - bisa diisi dari database jika ada)
    row['Catatan_Akademik'] = ''
    row['Catatan_Sikap'] = ''
    row['Catatan_Kehadiran'] = ''
    row['Rekomendasi'] = ''
    row['Catatan_Wali_Kelas'] = ''
    
    // TANDA TANGAN & APPROVAL
    row['Tanggal_Penyerahan'] = ''
    row['Nama_Wali_Kelas'] = ''
    row['Nama_Kepala_Sekolah'] = ''
    row['Tanda_Tangan_Wali_Santri'] = ''

    mailMergeData.push(row)
  })

  // Create workbook
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(mailMergeData)
  
  // Auto width untuk semua kolom
  const maxWidths: { [key: string]: number } = {}
  
  // Calculate max width per column
  Object.keys(mailMergeData[0] || {}).forEach(key => {
    maxWidths[key] = key.length + 2 // header length
    
    mailMergeData.forEach(row => {
      const value = String(row[key] || '')
      if (value.length > maxWidths[key]) {
        maxWidths[key] = Math.min(value.length + 2, 50) // max 50
      }
    })
  })
  
  worksheet['!cols'] = Object.keys(mailMergeData[0] || {}).map(key => ({
    wch: maxWidths[key]
  }))
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mail Merge Data')

  // Download file
  const fileName = `MailMerge_Raport_${kelasName}_Semester${semester}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
  
  return {
    success: true,
    fileName,
    totalRecords: mailMergeData.length,
    columns: Object.keys(mailMergeData[0] || {}).length
  }
}

/**
 * Get list of available merge fields untuk dokumentasi
 */
export function getMailMergeFields(
  nilaiData: any[],
  categories: any[]
): { category: string; fields: string[] }[] {
  const allMapelNames = [...new Set(
    nilaiData
      .filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
      .map(n => n.mapel?.name)
      .filter(Boolean)
  )].sort()

  const allCategoryNames = categories.map(c => c.name).sort()

  return [
    {
      category: 'Metadata',
      fields: [
        'Nomor_Raport',
        'Tanggal_Cetak',
        'Tahun_Akademik',
        'Semester',
        'Kelas',
        'Lembaga'
      ]
    },
    {
      category: 'Identitas Santri',
      fields: [
        'NIS',
        'NISN',
        'Nama_Lengkap',
        'Jenis_Kelamin',
        'Tempat_Lahir',
        'Tanggal_Lahir',
        'Alamat'
      ]
    },
    {
      category: 'Data Wali',
      fields: [
        'Nama_Ayah',
        'Pekerjaan_Ayah',
        'Nama_Ibu',
        'Pekerjaan_Ibu',
        'Nama_Wali',
        'Hubungan_Wali'
      ]
    },
    {
      category: 'Ranking & Prestasi',
      fields: [
        'Ranking',
        'Total_Santri',
        'Ranking_Text',
        'Rata_Rata_Keseluruhan',
        'Predikat_Keseluruhan',
        'Deskripsi_Predikat'
      ]
    },
    {
      category: 'Nilai Mata Pelajaran',
      fields: allMapelNames.flatMap(name => {
        const clean = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
        return [
          `Mapel_${clean}_Nilai`,
          `Mapel_${clean}_Predikat`,
          `Mapel_${clean}_Deskripsi`
        ]
      })
    },
    {
      category: 'Nilai Non-Mapel',
      fields: allCategoryNames.map(name => {
        const clean = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
        return `NonMapel_${clean}`
      })
    },
    {
      category: 'Tahfidz',
      fields: [
        'Tahfidz_Total_Ujian',
        'Tahfidz_Total_Ayat',
        'Tahfidz_Rata_Rata',
        'Tahfidz_Predikat',
        'Tahfidz_Surah',
        'Tahfidz_1_Surah',
        'Tahfidz_1_Ayat',
        'Tahfidz_1_Nilai',
        'Tahfidz_2_Surah',
        'Tahfidz_2_Ayat',
        'Tahfidz_2_Nilai',
        // ... up to 5
      ]
    },
    {
      category: 'Catatan',
      fields: [
        'Catatan_Akademik',
        'Catatan_Sikap',
        'Catatan_Kehadiran',
        'Rekomendasi',
        'Catatan_Wali_Kelas'
      ]
    },
    {
      category: 'Tanda Tangan',
      fields: [
        'Tanggal_Penyerahan',
        'Nama_Wali_Kelas',
        'Nama_Kepala_Sekolah',
        'Tanda_Tangan_Wali_Santri'
      ]
    }
  ]
}





