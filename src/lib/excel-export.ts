"use client"

import * as XLSX from 'xlsx'

interface ExportRaporData {
  santri: {
    nis: string
    nama: string
    kelas: string | null
  }
  nilaiPerMapel: {
    mapelName: string
    nilaiList: {
      ujianName: string
      ujianType: string
      score: number
    }[]
    rataRata: number
  }[]
  rataRataKeseluruhan: number
  ranking?: number
}

export function exportRaporToExcel(data: ExportRaporData, filename: string) {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Sheet 1: Informasi Santri
  const infoData = [
    ['RAPOR NILAI UJIAN'],
    [''],
    ['NIS', data.santri.nis],
    ['Nama', data.santri.nama],
    ['Kelas', data.santri.kelas || '-'],
    ['Rata-rata Keseluruhan', data.rataRataKeseluruhan.toFixed(2)],
    ...(data.ranking ? [['Ranking', data.ranking]] : []),
  ]
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData)
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Informasi')

  // Sheet 2: Nilai Detail
  const nilaiData: any[][] = [
    ['Mata Pelajaran', 'Nama Ujian', 'Jenis Ujian', 'Nilai', 'Rata-rata Mapel']
  ]

  data.nilaiPerMapel.forEach((mapel) => {
    mapel.nilaiList.forEach((nilai, index) => {
      nilaiData.push([
        index === 0 ? mapel.mapelName : '',
        nilai.ujianName,
        nilai.ujianType,
        nilai.score,
        index === 0 ? mapel.rataRata.toFixed(2) : ''
      ])
    })
    // Add empty row between subjects
    nilaiData.push(['', '', '', '', ''])
  })

  const wsNilai = XLSX.utils.aoa_to_sheet(nilaiData)
  
  // Set column widths
  wsNilai['!cols'] = [
    { wch: 25 }, // Mata Pelajaran
    { wch: 30 }, // Nama Ujian
    { wch: 15 }, // Jenis Ujian
    { wch: 10 }, // Nilai
    { wch: 15 }, // Rata-rata
  ]

  XLSX.utils.book_append_sheet(wb, wsNilai, 'Nilai Detail')

  // Sheet 3: Ringkasan per Mapel
  const ringkasanData: any[][] = [
    ['Mata Pelajaran', 'Jumlah Ujian', 'Rata-rata']
  ]

  data.nilaiPerMapel.forEach((mapel) => {
    ringkasanData.push([
      mapel.mapelName,
      mapel.nilaiList.length,
      mapel.rataRata.toFixed(2)
    ])
  })

  ringkasanData.push(['', '', ''])
  ringkasanData.push(['RATA-RATA KESELURUHAN', '', data.rataRataKeseluruhan.toFixed(2)])

  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData)
  wsRingkasan['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
  ]

  XLSX.utils.book_append_sheet(wb, wsRingkasan, 'Ringkasan')

  // Generate and download
  XLSX.writeFile(wb, filename)
}

interface ExportKelasData {
  kelas: string
  santriList: {
    nis: string
    nama: string
    nilaiPerMapel: {
      mapelName: string
      rataRata: number
    }[]
    rataRataKeseluruhan: number
    ranking?: number
  }[]
  mapelList: string[]
}

export function exportKelasToExcel(data: ExportKelasData, filename: string) {
  const wb = XLSX.utils.book_new()

  // Create header row
  const headers = [
    'Ranking',
    'NIS',
    'Nama',
    ...data.mapelList,
    'Rata-rata'
  ]

  // Create data rows
  const rows = data.santriList.map((santri) => {
    const mapelScores = data.mapelList.map((mapelName) => {
      const mapel = santri.nilaiPerMapel.find(m => m.mapelName === mapelName)
      return mapel ? mapel.rataRata.toFixed(2) : '-'
    })

    return [
      santri.ranking || '-',
      santri.nis,
      santri.nama,
      ...mapelScores,
      santri.rataRataKeseluruhan.toFixed(2)
    ]
  })

  // Combine header and data
  const sheetData = [
    [`RAPOR KELAS ${data.kelas}`],
    [],
    headers,
    ...rows
  ]

  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  // Set column widths
  const colWidths = [
    { wch: 8 },  // Ranking
    { wch: 12 }, // NIS
    { wch: 25 }, // Nama
    ...data.mapelList.map(() => ({ wch: 12 })), // Mapel columns
    { wch: 12 }, // Rata-rata
  ]
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Rapor Kelas')

  // Generate and download
  XLSX.writeFile(wb, filename)
}
