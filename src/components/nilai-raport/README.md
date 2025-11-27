# Sistem Raport Komprehensif

## Overview
Sistem raport komprehensif untuk Pondok Tadzimussunnah yang menyediakan berbagai tampilan dan analisis nilai santri.

## Komponen Utama

### 1. **ComprehensiveRaport** (`comprehensive-raport.tsx`)
Tampilan raport lengkap dengan format profesional yang siap cetak.

**Fitur:**
- KOP raport dengan informasi lembaga
- Informasi lengkap santri (NIS, NISN, Kelas, Ranking)
- Tabel nilai mata pelajaran dengan predikat (A-E)
- Penilaian sikap & kepribadian (non-mapel)
- Capaian tahfidz dengan detail surah dan ayat
- Skala nilai dan keterangan predikat
- Area tanda tangan wali dan wali kelas
- Design print-friendly (A4)
- Tombol download PDF dan cetak

**Skala Nilai:**
- A (9.0-10): Sangat Baik
- B (8.0-8.9): Baik
- C (7.0-7.9): Cukup
- D (6.0-6.9): Kurang
- E (<6.0): Sangat Kurang

**Props:**
```typescript
{
  student: any              // Data santri
  nilaiData: any[]         // Array nilai santri
  ujianHifdzData: any[]    // Array ujian hifdz
  categories: any[]        // Kategori penilaian
  academicYear: string     // Tahun akademik
  semester: string         // Semester
  kelasName: string        // Nama kelas
  lembagaName: string      // Nama lembaga
  ranking?: number         // Ranking di kelas
  totalStudents?: number   // Total santri di kelas
  raportNumber?: string    // Nomor raport
}
```

---

### 2. **RaportStatistics** (`raport-statistics.tsx`)
Analisis statistik dan visualisasi performa akademik santri.

**Fitur:**
- Metrik kunci (rata-rata, nilai tertinggi, terendah, ranking)
- Tabel performa per mata pelajaran
- Status pencapaian dengan badge warna
- Ringkasan prestasi terbaik
- Rekomendasi mata pelajaran yang perlu ditingkatkan
- Distribusi predikat (A-E) dalam bentuk grid
- Statistik tahfidz (total ujian, total ayat, rata-rata nilai)

**Analisis yang Ditampilkan:**
- Overall average dari semua nilai
- Performa per mapel dengan highest/lowest scores
- Identifikasi mata pelajaran terbaik
- Identifikasi mata pelajaran yang perlu perbaikan
- Visualisasi distribusi predikat

**Props:**
```typescript
{
  nilaiData: any[]         // Array nilai santri
  ujianHifdzData: any[]    // Array ujian hifdz
  categories: any[]        // Kategori penilaian
  ranking?: number         // Ranking di kelas
  totalStudents?: number   // Total santri di kelas
}
```

---

### 3. **RaportNotes** (`raport-notes.tsx`)
Form untuk menambahkan catatan guru, penilaian sikap, dan rekomendasi.

**Fitur:**
- Auto-generate suggestions berdasarkan performa
- Form catatan prestasi akademik
- Form catatan sikap & perilaku
- Form rekomendasi & saran
- Click-to-add suggestions ke field rekomendasi
- Save functionality dengan status feedback
- Rekomendasi otomatis berdasarkan:
  - Overall average santri
  - Mata pelajaran yang lemah
  - Prediksi kebutuhan bimbingan

**Suggestions Generated:**
- Jika average >= 9: Pujian dan saran menjadi tutor
- Jika average >= 8: Motivasi untuk mencapai maksimal
- Jika average >= 7: Saran peningkatan pemahaman
- Jika average < 7: Rekomendasi bimbingan intensif
- Identifikasi mata pelajaran yang perlu diperbaiki

**Props:**
```typescript
{
  studentId: string                    // ID santri
  studentName: string                  // Nama santri
  nilaiData: any[]                    // Array nilai santri
  initialNotes?: {                    // Catatan yang sudah ada
    academicNotes?: string
    behaviorNotes?: string
    recommendations?: string
  }
  onSaveNotes?: (notes: {            // Callback untuk save
    academicNotes: string
    behaviorNotes: string
    recommendations: string
  }) => Promise<void>
}
```

---

### 4. **RaportCard** (`raport-card.tsx`)
Tampilan raport sederhana dalam bentuk card (existing component).

**Fitur:**
- View kompak untuk preview cepat
- Grouping nilai mapel dan non-mapel
- Nilai tahfidz
- Tombol cetak dan download PDF individual

---

### 5. **ExportRaportButtons** (`export-raport-buttons.tsx`)
Tombol untuk export raport ke berbagai format.

**Fitur:**
- Export ke Excel (semua santri)
- Generate PDF batch (semua santri)
- Progress indicator untuk PDF generation
- Multiple sheets untuk Excel (Mapel, Non-Mapel, Tahfidz)

---

## Implementasi di Page

### Tabs Structure
Halaman raport menggunakan tab navigation dengan 4 view:

```typescript
<Tabs defaultValue="comprehensive">
  <TabsList>
    <TabsTrigger value="comprehensive">Raport Lengkap</TabsTrigger>
    <TabsTrigger value="simple">Raport Sederhana</TabsTrigger>
    <TabsTrigger value="statistics">Statistik</TabsTrigger>
    <TabsTrigger value="notes">Catatan</TabsTrigger>
  </TabsList>

  <TabsContent value="comprehensive">
    <ComprehensiveRaport {...props} />
  </TabsContent>
  
  <TabsContent value="simple">
    <RaportCard {...props} />
  </TabsContent>
  
  <TabsContent value="statistics">
    <RaportStatistics {...props} />
  </TabsContent>
  
  <TabsContent value="notes">
    <RaportNotes {...props} />
  </TabsContent>
</Tabs>
```

### Data Flow

1. **Fetch Data** (Server Component):
   - Kelas dengan santri
   - Semua nilai untuk kelas
   - Ujian hifdz untuk kelas
   - Kategori lembaga
   - Academic year info
   - Lembaga info

2. **Calculate Ranking**:
   - Hitung rata-rata mapel per santri
   - Sort berdasarkan rata-rata
   - Assign ranking
   - Generate nomor raport

3. **Render per Santri**:
   - Filter nilai per santri
   - Filter ujian hifdz per santri
   - Render tabs dengan 4 komponen

---

## Print Functionality

### Print Styles
Komponen ComprehensiveRaport memiliki built-in print styles:

```css
@media print {
  @page {
    size: A4;
    margin: 15mm;
  }
  
  /* Hide non-printable elements */
  .print:hidden { display: none !important; }
  
  /* Prevent page breaks inside tables */
  table { page-break-inside: avoid; }
  
  /* Preserve colors */
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

### Cara Cetak:
1. Klik tombol "Cetak" atau "Download PDF"
2. Browser akan membuka print dialog
3. Pilih "Save as PDF" atau printer fisik
4. Format A4 otomatis terset

---

## Grade Calculation

### Mapel Average
```typescript
const mapelAverage = nilaiList.reduce((sum, n) => sum + (n.score || 0), 0) / nilaiList.length
```

### Overall Average
```typescript
const overallAverage = allScores.reduce((a, b) => a + b, 0) / allScores.length
```

### Predicate Function
```typescript
function getGradePredicate(score: number) {
  if (score >= 9) return "A" // Sangat Baik
  if (score >= 8) return "B" // Baik
  if (score >= 7) return "C" // Cukup
  if (score >= 6) return "D" // Kurang
  return "E" // Sangat Kurang
}
```

---

## Export Features

### Excel Export Structure (ENHANCED ✨):

File Excel yang di-export sekarang memiliki **6 sheet professional** dengan styling lengkap:

#### 1. 📊 **Ringkasan**
- Header informasi kelas & semester
- Statistik kelas (rata-rata, tertinggi, terendah)
- Distribusi predikat dengan persentase
- Layout yang rapi dengan cell merging

#### 2. 🏆 **Ranking**
- Daftar santri terurut berdasarkan rata-rata
- **Conditional formatting** dengan color coding:
  - 🟢 Hijau (≥9.0): Sangat Baik
  - 🔵 Biru (8.0-8.9): Baik
  - 🟡 Kuning (7.0-7.9): Cukup
  - 🟠 Orange (6.0-6.9): Kurang
  - 🔴 Merah (<6.0): Sangat Kurang
- **Freeze panes** untuk header

#### 3. 📚 **Nilai Mapel (Detail)**
- Satu kolom per mata pelajaran
- Nilai rata-rata per santri + predikat + ranking
- Row terakhir: rata-rata kelas per mapel
- **Freeze 3 kolom kiri** + header
- **Conditional formatting** untuk semua nilai
- **Borders** untuk semua cells

#### 4. 📋 **Nilai Non-Mapel**
- Penilaian sikap & kepribadian
- Kategori dikelompokkan (Fiqh, Akhlak, dll)
- Header hijau untuk diferensiasi
- Freeze 3 kolom kiri

#### 5. 📖 **Tahfidz**
- Detail ujian hafalan per santri
- Auto-calculate total ayat
- Ringkasan statistik (total ujian, total ayat, rata-rata)
- Header orange
- Wide column untuk keterangan

#### 6. 📈 **Analisis Mapel**
- Statistik per mata pelajaran
- Kolom: Rata-rata, Tertinggi, Terendah, Jumlah Nilai, **Standar Deviasi**
- Insights untuk evaluasi pengajaran
- Identifikasi mapel yang perlu perhatian

### Enhanced Features:
✅ **Professional Styling**: Headers dengan warna, bold, borders  
✅ **Conditional Formatting**: Auto-color berdasarkan nilai  
✅ **Freeze Panes**: Header dan kolom penting tetap visible  
✅ **Auto Width**: Kolom disesuaikan otomatis  
✅ **Cell Borders**: Semua cells rapi dengan borders  
✅ **Statistics**: Standar deviasi, distribusi predikat, dll  
✅ **Summary Row**: Rata-rata kelas di sheet nilai mapel  

### PDF Export:
- Individual PDF per student
- Batch PDF generation dengan progress
- Menggunakan jsPDF dan autoTable

### Dokumentasi Lengkap:
- Technical docs: `src/lib/EXPORT_EXCEL_DOCUMENTATION.md`
- Visual guide: `src/lib/EXPORT_EXCEL_VISUAL_GUIDE.md`

---

## Best Practices

### Performance
- Filter data per santri untuk menghindari re-render
- Lazy load heavy components
- Use memo untuk calculations yang expensive

### Accessibility
- Semantic HTML untuk screen readers
- Proper heading hierarchy
- Keyboard navigation support

### Responsive Design
- Mobile-friendly tabs
- Scrollable tables on small screens
- Touch-friendly buttons

---

## Future Enhancements

1. **Chart Visualization**
   - Line chart untuk trend nilai
   - Radar chart untuk comparison
   - Bar chart untuk ranking distribution

2. **Notes Persistence**
   - Save catatan guru ke database
   - History catatan per semester
   - Template catatan

3. **PDF Customization**
   - Custom KOP per lembaga
   - Logo upload
   - Template selection

4. **Comparison Features**
   - Compare dengan rata-rata kelas
   - Comparison dengan semester sebelumnya
   - Trend analysis

5. **Notification**
   - Alert untuk nilai rendah
   - Notify wali santri
   - Email raport otomatis

---

## Troubleshooting

### Raport tidak ter-print dengan benar
- Pastikan browser sudah support CSS @media print
- Check print preview sebelum print
- Gunakan browser modern (Chrome, Firefox, Edge)

### Nilai tidak muncul
- Pastikan nilaiData di-filter dengan benar per santri
- Check console untuk error
- Pastikan academicYearId dan semester match

### Export gagal
- Check browser console untuk error
- Pastikan library XLSX dan jsPDF ter-install
- Check memory jika export banyak data

---

## Credits

Developed for Pondok Tadzimussunnah Academic Management System.
Using: Next.js, React, TypeScript, Shadcn UI, jsPDF, XLSX.

