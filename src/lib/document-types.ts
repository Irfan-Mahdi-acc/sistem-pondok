/**
 * Comprehensive Document Types for Indonesian Islamic Boarding School (Pondok)
 */

export const DOCUMENT_TYPES = {
  // Surat Masuk
  SURAT_MASUK: {
    code: 'SM',
    label: 'Surat Masuk',
    description: 'Surat yang diterima dari pihak eksternal'
  },
  
  // Surat Keluar
  SURAT_KELUAR: {
    code: 'SKel',
    label: 'Surat Keluar',
    description: 'Surat yang dikirim ke pihak eksternal'
  },
  
  // Surat Keputusan
  SK_PENGANGKATAN: {
    code: 'SK-P',
    label: 'SK Pengangkatan',
    description: 'Surat Keputusan Pengangkatan Pegawai/Ustadz'
  },
  SK_PEMBERHENTIAN: {
    code: 'SK-B',
    label: 'SK Pemberhentian',
    description: 'Surat Keputusan Pemberhentian'
  },
  SK_MUTASI: {
    code: 'SK-M',
    label: 'SK Mutasi',
    description: 'Surat Keputusan Mutasi/Perpindahan'
  },
  SK_PENUGASAN: {
    code: 'SK-T',
    label: 'SK Penugasan',
    description: 'Surat Keputusan Penugasan'
  },
  
  // Surat Tugas
  SURAT_TUGAS: {
    code: 'ST',
    label: 'Surat Tugas',
    description: 'Surat Penugasan untuk kegiatan tertentu'
  },
  
  // Surat Keterangan
  SKET_SANTRI: {
    code: 'SKet-S',
    label: 'Surat Keterangan Santri',
    description: 'Surat keterangan untuk santri aktif'
  },
  SKET_LULUS: {
    code: 'SKet-L',
    label: 'Surat Keterangan Lulus',
    description: 'Surat keterangan kelulusan santri'
  },
  SKET_BERKELAKUAN_BAIK: {
    code: 'SKet-BB',
    label: 'Surat Keterangan Berkelakuan Baik',
    description: 'Surat keterangan akhlak santri'
  },
  SKET_PEGAWAI: {
    code: 'SKet-P',
    label: 'Surat Keterangan Pegawai',
    description: 'Surat keterangan untuk pegawai/ustadz'
  },
  
  // Surat Undangan
  UNDANGAN_RAPAT: {
    code: 'Und-R',
    label: 'Undangan Rapat',
    description: 'Undangan rapat internal/eksternal'
  },
  UNDANGAN_ACARA: {
    code: 'Und-A',
    label: 'Undangan Acara',
    description: 'Undangan kegiatan/acara'
  },
  
  // Surat Edaran
  SURAT_EDARAN: {
    code: 'SE',
    label: 'Surat Edaran',
    description: 'Pemberitahuan/pengumuman resmi'
  },
  
  // Surat Pemberitahuan
  SURAT_PEMBERITAHUAN: {
    code: 'SPem',
    label: 'Surat Pemberitahuan',
    description: 'Pemberitahuan kepada pihak terkait'
  },
  
  // Surat Permohonan
  PERMOHONAN_IZIN: {
    code: 'SPer-I',
    label: 'Permohonan Izin',
    description: 'Surat permohonan izin kegiatan'
  },
  PERMOHONAN_BANTUAN: {
    code: 'SPer-B',
    label: 'Permohonan Bantuan',
    description: 'Surat permohonan bantuan/donasi'
  },
  
  // Surat Rekomendasi
  REKOMENDASI: {
    code: 'Rek',
    label: 'Surat Rekomendasi',
    description: 'Surat rekomendasi untuk berbagai keperluan'
  },
  
  // Surat Kuasa
  SURAT_KUASA: {
    code: 'SKu',
    label: 'Surat Kuasa',
    description: 'Surat pemberian kuasa'
  },
  
  // Surat Perintah
  SURAT_PERINTAH: {
    code: 'SPer',
    label: 'Surat Perintah',
    description: 'Surat perintah untuk pelaksanaan tugas'
  },
  
  // Nota Dinas
  NOTA_DINAS: {
    code: 'ND',
    label: 'Nota Dinas',
    description: 'Komunikasi internal antar bagian'
  },
  
  // Berita Acara
  BERITA_ACARA: {
    code: 'BA',
    label: 'Berita Acara',
    description: 'Dokumen hasil kegiatan/rapat'
  },
  
  // Laporan
  LAPORAN_KEGIATAN: {
    code: 'Lap-K',
    label: 'Laporan Kegiatan',
    description: 'Laporan pelaksanaan kegiatan'
  },
  LAPORAN_KEUANGAN: {
    code: 'Lap-Keu',
    label: 'Laporan Keuangan',
    description: 'Laporan pertanggungjawaban keuangan'
  },
  
  // MOU & Kerjasama
  MOU: {
    code: 'MOU',
    label: 'MOU/Kerjasama',
    description: 'Memorandum of Understanding'
  },
  
  // Surat Izin
  IZIN_CUTI: {
    code: 'Izin-C',
    label: 'Izin Cuti',
    description: 'Surat izin cuti pegawai/ustadz'
  },
  IZIN_SANTRI: {
    code: 'Izin-S',
    label: 'Izin Santri',
    description: 'Surat izin pulang/keluar santri'
  },
  
  // Lainnya
  LAINNYA: {
    code: 'DOC',
    label: 'Dokumen Lainnya',
    description: 'Dokumen/surat lainnya'
  },
} as const

export type DocumentType = keyof typeof DOCUMENT_TYPES

export function getDocumentTypeInfo(type: string) {
  return DOCUMENT_TYPES[type as DocumentType] || DOCUMENT_TYPES.LAINNYA
}

export function getAllDocumentTypes() {
  return Object.entries(DOCUMENT_TYPES).map(([key, value]) => ({
    value: key,
    ...value
  }))
}

// Group by category for better UI organization
export const DOCUMENT_CATEGORIES = {
  'Surat Masuk & Keluar': [
    'SURAT_MASUK',
    'SURAT_KELUAR',
  ],
  'Surat Keputusan': [
    'SK_PENGANGKATAN',
    'SK_PEMBERHENTIAN',
    'SK_MUTASI',
    'SK_PENUGASAN',
  ],
  'Surat Keterangan': [
    'SKET_SANTRI',
    'SKET_LULUS',
    'SKET_BERKELAKUAN_BAIK',
    'SKET_PEGAWAI',
  ],
  'Surat Undangan': [
    'UNDANGAN_RAPAT',
    'UNDANGAN_ACARA',
  ],
  'Surat Tugas & Perintah': [
    'SURAT_TUGAS',
    'SURAT_PERINTAH',
  ],
  'Permohonan & Izin': [
    'PERMOHONAN_IZIN',
    'PERMOHONAN_BANTUAN',
    'IZIN_CUTI',
    'IZIN_SANTRI',
  ],
  'Komunikasi Internal': [
    'NOTA_DINAS',
    'SURAT_EDARAN',
    'SURAT_PEMBERITAHUAN',
  ],
  'Laporan & Dokumentasi': [
    'BERITA_ACARA',
    'LAPORAN_KEGIATAN',
    'LAPORAN_KEUANGAN',
  ],
  'Lainnya': [
    'REKOMENDASI',
    'SURAT_KUASA',
    'MOU',
    'LAINNYA',
  ],
}


