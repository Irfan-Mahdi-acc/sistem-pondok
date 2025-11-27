# 📊 Dokumentasi Export Excel - Raport Komprehensif

## Overview
Sistem export Excel yang telah diperbaiki dan ditingkatkan dengan styling profesional, multiple sheets, statistik detail, dan formatting otomatis.

---

## 🎨 Fitur Utama

### 1. **6 Sheet Terpisah dengan Fungsi Berbeda**

#### Sheet 1: 📊 Ringkasan
**Konten:**
- Header informasi (Kelas, Semester, Tanggal Cetak, Total Santri)
- Statistik kelas (Rata-rata, Tertinggi, Terendah)
- Distribusi predikat dengan persentase (A, B, C, D, E)

**Styling:**
- Title dengan font besar dan warna biru
- Cell merge untuk title
- Layout yang rapi dan mudah dibaca

---

#### Sheet 2: 🏆 Ranking
**Konten:**
- Daftar santri urut berdasarkan rata-rata nilai
- Kolom: Ranking, NIS, Nama, Rata-rata, Predikat

**Fitur:**
- **Freeze Panes**: Header tetap terlihat saat scroll
- **Conditional Formatting**: Nilai diwarnai berdasarkan range
  - 🟢 Hijau: ≥ 9.0 (A)
  - 🔵 Biru: 8.0-8.9 (B)
  - 🟡 Kuning: 7.0-7.9 (C)
  - 🟠 Orange: 6.0-6.9 (D)
  - 🔴 Merah: < 6.0 (E)
- Header dengan background biru dan text putih bold

---

#### Sheet 3: 📚 Nilai Mapel
**Konten:**
- Tabel detail nilai semua mata pelajaran
- Satu kolom per mapel dengan nilai rata-rata per santri
- Kolom tambahan: Rata-rata keseluruhan, Predikat, Ranking
- Row terakhir: Rata-rata kelas per mapel

**Fitur:**
- **Freeze Panes**: 3 kolom pertama (No, NIS, Nama) dan header frozen
- **Conditional Formatting**: Semua nilai diwarnai sesuai range
- **Auto Width**: Kolom otomatis disesuaikan
- Header dengan background biru
- Cell merge untuk title

**Kolom:**
```
No | NIS | Nama | Matematika | Bahasa Arab | ... | Rata-rata | Predikat | Ranking
```

---

#### Sheet 4: 📋 Nilai Non-Mapel
**Konten:**
- Penilaian sikap & kepribadian
- Kategori dikelompokkan (misal: Fiqh, Akhlak, dll)
- Format: `Nama Kategori (Nama Grup)`

**Fitur:**
- Header dengan background hijau
- Layout yang terorganisir per grup
- Auto width untuk semua kolom
- Freeze 3 kolom pertama

**Contoh Kolom:**
```
No | NIS | Nama | Sholat (Fiqh) | Zakat (Fiqh) | Kejujuran (Akhlak) | ...
```

---

#### Sheet 5: 📖 Tahfidz
**Konten:**
- Detail ujian hafalan per santri
- Kolom: No, NIS, Nama, Surah, Ayat Mulai, Ayat Selesai, Total Ayat, Nilai, Keterangan
- Ringkasan di bawah: Total ujian, Total ayat, Rata-rata nilai

**Fitur:**
- Header dengan background orange
- Auto-calculate total ayat
- Summary statistics
- Wide column untuk keterangan

---

#### Sheet 6: 📈 Analisis Mapel
**Konten:**
- Analisis statistik per mata pelajaran
- Kolom: Mata Pelajaran, Rata-rata, Tertinggi, Terendah, Jumlah Nilai, Standar Deviasi

**Fitur:**
- Menampilkan performa setiap mapel
- Standar deviasi untuk melihat konsistensi
- Identifikasi mapel dengan performa tinggi/rendah
- Header dengan background biru muda

**Manfaat:**
- Guru dapat melihat mapel mana yang perlu perhatian khusus
- Identifikasi mapel dengan nilai yang sangat bervariasi
- Evaluasi efektivitas pengajaran per mapel

---

## 🎨 Styling & Formatting

### Color Scheme

#### Headers
- **Ringkasan/Ranking/Mapel**: `#4472C4` (Biru)
- **Non-Mapel**: `#70AD47` (Hijau)
- **Tahfidz**: `#F4B084` (Orange)
- **Analisis**: `#5B9BD5` (Biru Muda)

#### Conditional Formatting (Nilai)
```typescript
Score >= 9.0  → #92D050 (Hijau) - Sangat Baik
Score >= 8.0  → #00B0F0 (Biru)  - Baik
Score >= 7.0  → #FFFF00 (Kuning) - Cukup
Score >= 6.0  → #FFC000 (Orange) - Kurang
Score < 6.0   → #FF0000 (Merah)  - Sangat Kurang
```

### Borders
- Semua cell memiliki border tipis abu-abu (`#D0D0D0`)
- Header dengan border hitam yang lebih tebal

### Font
- **Header**: Bold, size 11pt, white text
- **Content**: Normal, size 10pt
- **Numbers**: Center aligned, bold untuk nilai

---

## 📐 Layout Features

### 1. **Freeze Panes**
Memungkinkan scroll dengan header tetap visible:
- **Ranking**: Freeze row 3 (header)
- **Nilai Mapel**: Freeze 3 kolom kiri + row 3
- **Non-Mapel**: Freeze 3 kolom kiri + row 3
- **Tahfidz**: Freeze row 3

### 2. **Auto Width Columns**
Setiap sheet memiliki width yang sudah dioptimalkan:
```typescript
Ringkasan:    [25, 20, 15]
Ranking:      [10, 15, 30, 12, 10]
Nilai Mapel:  [5, 15, 30, ...mapels: 12, 12, 10, 10]
Non-Mapel:    [5, 15, 30, ...categories: 15]
Tahfidz:      [5, 15, 30, 20, 12, 12, 12, 10, 35]
Analisis:     [30, 12, 12, 12, 15, 18]
```

### 3. **Cell Merging**
Title cells di-merge untuk tampilan yang lebih profesional:
- Title di setiap sheet di-merge horizontal
- Alignment center untuk title

---

## 🔢 Calculations

### Automatic Calculations

#### 1. **Rata-rata per Santri**
```typescript
average = sum(scores) / count(scores)
```

#### 2. **Predikat**
```typescript
if (score >= 9) return 'A'
if (score >= 8) return 'B'
if (score >= 7) return 'C'
if (score >= 6) return 'D'
return 'E'
```

#### 3. **Ranking**
- Sort santri berdasarkan rata-rata descending
- Assign ranking 1, 2, 3, ...

#### 4. **Statistik Kelas**
```typescript
classAverage = sum(allAverages) / studentCount
highestScore = max(allAverages)
lowestScore = min(allAverages)
```

#### 5. **Distribusi Predikat**
```typescript
countA = students.filter(s => s.predicate === 'A').length
percentageA = (countA / totalStudents) * 100
```

#### 6. **Standar Deviasi**
```typescript
variance = sum((score - average)²) / count
standardDeviation = √variance
```

#### 7. **Total Ayat Tahfidz**
```typescript
totalAyat = ayatEnd - ayatStart + 1
```

---

## 📊 Data Structure

### Input Parameters
```typescript
exportRaportToExcel(
  kelasName: string,        // Nama kelas (e.g., "1 Ula")
  semester: string,         // Semester (e.g., "1" atau "2")
  students: any[],          // Array santri
  nilaiData: any[],         // Array nilai (mapel & non-mapel)
  ujianHifdzData: any[],    // Array ujian hifdz
  categories: any[]         // Array kategori non-mapel
)
```

### Student Object
```typescript
{
  id: string,
  nis: string,
  nama: string,
  // ... other fields
}
```

### Nilai Object
```typescript
{
  id: string,
  santriId: string,
  mapelId?: string,
  categoryId?: string,
  category: 'UJIAN' | 'TUGAS' | 'NON_MAPEL',
  score?: number,
  letterGrade?: string,
  gradeType?: 'NUMERIC' | 'LETTER',
  mapel?: { name: string }
}
```

### Ujian Hifdz Object
```typescript
{
  id: string,
  santriId: string,
  surah: string,
  ayatStart: number,
  ayatEnd: number,
  grade: string,
  note?: string
}
```

### Category Object
```typescript
{
  id: string,
  name: string,
  groupName?: string,
  gradeType: 'NUMERIC' | 'LETTER'
}
```

---

## 🚀 Usage Example

### Basic Usage
```typescript
import { exportRaportToExcel } from '@/lib/export-utils'

// In your component
const handleExportExcel = () => {
  exportRaportToExcel(
    'Kelas 1 Ula',
    '1',
    students,
    nilaiData,
    ujianHifdzData,
    categories
  )
}

<Button onClick={handleExportExcel}>
  Export to Excel
</Button>
```

### With Loading State
```typescript
const [isExporting, setIsExporting] = useState(false)

const handleExportExcel = () => {
  setIsExporting(true)
  try {
    exportRaportToExcel(kelasName, semester, students, nilaiData, ujianHifdzData, categories)
    toast.success('Excel berhasil di-export!')
  } catch (error) {
    console.error('Error exporting Excel:', error)
    toast.error('Gagal export Excel')
  } finally {
    setIsExporting(false)
  }
}
```

---

## 📁 Output File

### File Naming Convention
```
Raport_{KelasName}_Semester_{Semester}_{Date}.xlsx
```

**Contoh:**
```
Raport_1_Ula_Semester_1_2024-11-27.xlsx
```

### File Structure
```
📄 Raport_1_Ula_Semester_1_2024-11-27.xlsx
├── 📊 Ringkasan          (Summary & Statistics)
├── 🏆 Ranking            (Student Rankings)
├── 📚 Nilai Mapel        (Subject Scores)
├── 📋 Nilai Non-Mapel    (Character Assessment)
├── 📖 Tahfidz            (Quran Memorization)
└── 📈 Analisis Mapel     (Subject Analysis)
```

---

## 💡 Tips & Best Practices

### For Users

1. **Open dengan Excel Desktop**
   - Styling dan formatting akan terlihat sempurna
   - Conditional formatting berfungsi optimal

2. **Gunakan Filter**
   - Header sudah support filter (jika Excel support)
   - Mudah untuk sort dan search data

3. **Print Friendly**
   - Layout sudah dioptimalkan untuk print
   - Landscape mode untuk sheet dengan banyak kolom

4. **Share**
   - File kompatibel dengan Google Sheets
   - Dapat dibuka di LibreOffice Calc

### For Developers

1. **Customize Colors**
   - Edit hex colors di function `styleHeader()`
   - Adjust conditional formatting range

2. **Add More Sheets**
   - Copy pattern dari existing sheets
   - Jangan lupa apply styling dan freeze panes

3. **Performance**
   - Untuk kelas besar (>100 santri), consider pagination
   - Test dengan berbagai ukuran data

4. **Error Handling**
   - Wrap dalam try-catch
   - Handle missing data gracefully

---

## 🐛 Troubleshooting

### Problem: File corrupt atau tidak bisa dibuka
**Solution:**
- Pastikan library XLSX ter-install dengan benar
- Check console untuk error
- Coba dengan data yang lebih kecil

### Problem: Styling tidak muncul
**Solution:**
- Pastikan menggunakan `bookType: 'xlsx'` dan `cellStyles: true`
- Update library XLSX ke versi terbaru
- Buka dengan Excel desktop, bukan Excel online

### Problem: Freeze panes tidak berfungsi
**Solution:**
- Property `!freeze` hanya support di Excel desktop
- Format: `{ xSplit: cols, ySplit: rows }`

### Problem: Export lambat untuk data besar
**Solution:**
- Conditional formatting memakan waktu
- Consider export tanpa styling untuk data >500 rows
- Implement progress indicator

---

## 📚 Dependencies

```json
{
  "xlsx": "^0.18.5"
}
```

### Installation
```bash
npm install xlsx
# or
yarn add xlsx
```

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Charts & Graphs**
   - Add chart objects to sheets
   - Visualisasi distribusi nilai
   - Trend analysis charts

2. **Custom Templates**
   - Allow custom KOP design
   - Configurable color schemes
   - Logo support

3. **Multi-Language**
   - Support English labels
   - Internationalization

4. **Advanced Filtering**
   - Auto-filter di semua headers
   - Pre-configured filter views

5. **Data Validation**
   - Dropdown lists untuk edit
   - Input validation rules

6. **Formulas**
   - Preserve Excel formulas
   - Dynamic calculations

7. **Protection**
   - Sheet protection
   - Cell locking for important data

---

## 📞 Support

Untuk pertanyaan atau issue terkait export Excel:
1. Check console untuk error messages
2. Verify data structure sesuai dengan expected format
3. Test dengan sample data kecil
4. Contact developer team

---

## 📄 License

Part of Pondok Tadzimussunnah Academic Management System.

---

**Last Updated:** November 27, 2024
**Version:** 2.0 (Enhanced)
**Author:** Development Team




