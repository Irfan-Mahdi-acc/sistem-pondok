# 📸 Visual Guide - Export Excel Raport

Panduan visual untuk memahami struktur dan isi setiap sheet dalam file Excel yang di-export.

---

## 📊 Sheet 1: Ringkasan

### Layout Preview
```
┌─────────────────────────────────────────────────────────┐
│        LAPORAN RAPORT KELAS                              │
│                                                          │
│  Kelas:           1 Ula                                  │
│  Semester:        1                                      │
│  Tanggal Cetak:   27 November 2024                      │
│  Total Santri:    30                                     │
│                                                          │
│  STATISTIK KELAS                                         │
│  Rata-rata Kelas:     8.45                              │
│  Nilai Tertinggi:     9.75                              │
│  Nilai Terendah:      6.20                              │
│                                                          │
│  DISTRIBUSI PREDIKAT                                     │
│  Predikat A (≥9.0):     8        26.7%                  │
│  Predikat B (8.0-8.9):  12       40.0%                  │
│  Predikat C (7.0-7.9):  7        23.3%                  │
│  Predikat D (6.0-6.9):  3        10.0%                  │
│  Predikat E (<6.0):     0        0.0%                   │
└─────────────────────────────────────────────────────────┘
```

### Purpose
- Quick overview statistik kelas
- Decision making untuk guru
- Laporan untuk kepala sekolah

---

## 🏆 Sheet 2: Ranking

### Layout Preview
```
┌──────────────────────────────────────────────────────────────────┐
│                       RANKING KELAS                              │
│                                                                  │
│ Ranking │ NIS    │ Nama Santri          │ Rata-rata │ Predikat │
├─────────┼────────┼──────────────────────┼───────────┼──────────┤
│    1    │ 00001  │ Ahmad Zaki          │   9.75    │    A     │ ← 🟢
│    2    │ 00015  │ Fatimah Azzahra     │   9.50    │    A     │ ← 🟢
│    3    │ 00007  │ Muhammad Hafidz     │   9.25    │    A     │ ← 🟢
│    4    │ 00023  │ Aisyah Nabila       │   8.85    │    B     │ ← 🔵
│    5    │ 00012  │ Umar Abdullah       │   8.70    │    B     │ ← 🔵
│    6    │ 00019  │ Khadijah Rahmah     │   8.50    │    B     │ ← 🔵
│   ...   │  ...   │        ...          │    ...    │   ...    │
│   28    │ 00008  │ Ali Ridho           │   6.75    │    D     │ ← 🟠
│   29    │ 00021  │ Zahra Amalia        │   6.50    │    D     │ ← 🟠
│   30    │ 00003  │ Hasan Ibrahim       │   6.20    │    D     │ ← 🟠
└──────────────────────────────────────────────────────────────────┘
```

### Color Legend
- 🟢 **Green** (≥9.0): Excellent performance
- 🔵 **Blue** (8.0-8.9): Good performance
- 🟡 **Yellow** (7.0-7.9): Satisfactory
- 🟠 **Orange** (6.0-6.9): Needs improvement
- 🔴 **Red** (<6.0): Requires attention

### Features
- ✅ Sorted by average (highest to lowest)
- ✅ Freeze header saat scroll
- ✅ Color-coded untuk quick identification
- ✅ Easy to identify top & bottom performers

---

## 📚 Sheet 3: Nilai Mapel (Detail)

### Layout Preview
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            NILAI MATA PELAJARAN - DETAIL                                        │
│                                                                                                 │
│ No │ NIS   │ Nama         │ B.Arab │ B.Inggris │ Matematika │ Fiqh │ Rata² │ Pred │ Rank │
├────┼───────┼──────────────┼────────┼───────────┼────────────┼──────┼───────┼──────┼──────┤
│  1 │ 00001 │ Ahmad Zaki   │  9.8   │    9.7    │    9.8     │ 9.7  │ 9.75  │  A   │  1   │ ← 🟢
│  2 │ 00015 │ Fatimah A.   │  9.5   │    9.6    │    9.4     │ 9.5  │ 9.50  │  A   │  2   │ ← 🟢
│  3 │ 00007 │ M. Hafidz    │  9.2   │    9.4    │    9.1     │ 9.3  │ 9.25  │  A   │  3   │ ← 🟢
│  4 │ 00023 │ Aisyah N.    │  8.9   │    8.8    │    8.9     │ 8.8  │ 8.85  │  B   │  4   │ ← 🔵
│ .. │  ...  │     ...      │  ...   │    ...    │    ...     │ ...  │  ...  │ ...  │ ...  │
│ 30 │ 00003 │ Hasan I.     │  6.2   │    6.3    │    6.1     │ 6.2  │ 6.20  │  D   │ 30   │ ← 🟠
├────┴───────┴──────────────┼────────┼───────────┼────────────┼──────┼───────┴──────┴──────┤
│      RATA-RATA KELAS      │  8.4   │    8.5    │    8.3     │ 8.6  │  8.45 │             │
└────────────────────────────┴────────┴───────────┴────────────┴──────┴─────────────────────┘
```

### Key Features
- **Frozen Columns**: No, NIS, Nama tetap visible saat scroll horizontal
- **Frozen Header**: Baris header tetap visible saat scroll vertical
- **Per-Cell Coloring**: Setiap nilai diwarnai sesuai performa
- **Class Average**: Row terakhir menampilkan rata-rata kelas per mapel
- **Individual Average**: Kolom rata-rata menunjukkan performa keseluruhan
- **Automatic Ranking**: Update otomatis berdasarkan rata-rata

### Use Cases
1. **Identifikasi Strengths & Weaknesses**
   - Lihat mapel mana yang unggul
   - Lihat mapel mana yang perlu perbaikan

2. **Comparison**
   - Bandingkan antar santri
   - Bandingkan dengan rata-rata kelas

3. **Monitoring**
   - Track performa individual
   - Identify learning gaps

---

## 📋 Sheet 4: Nilai Non-Mapel

### Layout Preview
```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                    NILAI NON-MAPEL (SIKAP & KEPRIBADIAN)                                 │
│                                                                                          │
│ No │ NIS  │ Nama      │ Sholat │ Puasa │ Kejujuran │ Disiplin │ Tanggung │ Kerapian │
│    │      │           │ (Fiqh) │(Fiqh) │ (Akhlak)  │ (Akhlak) │   Jawab  │ (Akhlak) │
│    │      │           │        │       │           │          │ (Akhlak) │          │
├────┼──────┼───────────┼────────┼───────┼───────────┼──────────┼──────────┼──────────┤
│  1 │ 0001 │ Ahmad Z.  │   A    │   A   │     A     │    A     │    A     │    B     │
│  2 │ 0015 │ Fatimah   │   A    │   B   │     A     │    A     │    A     │    A     │
│  3 │ 0007 │ M. Hafidz │   B    │   A   │     B     │    A     │    B     │    A     │
│ .. │ ...  │   ...     │  ...   │  ...  │    ...    │   ...    │   ...    │   ...    │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Features
- **Grouped Categories**: Kategori dikelompokkan berdasarkan aspek (Fiqh, Akhlak, dll)
- **Mixed Grading**: Support numeric (1-10) dan letter grades (A-E)
- **Frozen Panes**: 3 kolom pertama frozen
- **Green Header**: Membedakan dari nilai akademik

### Value Types
- **Letter Grades**: A, B, C, D, E
- **Numeric Grades**: 1-10 scale
- **Mixed**: Tergantung setting per kategori

---

## 📖 Sheet 5: Tahfidz

### Layout Preview
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CAPAIAN TAHFIDZ                                              │
│                                                                                                 │
│ No │ NIS  │ Nama       │ Surah        │ Ayat  │ Ayat   │ Total │ Nilai │ Keterangan          │
│    │      │            │              │ Mulai │ Selesai│ Ayat  │       │                     │
├────┼──────┼────────────┼──────────────┼───────┼────────┼───────┼───────┼─────────────────────┤
│  1 │ 0001 │ Ahmad Z.   │ Al-Baqarah   │   1   │   10   │  10   │  9.5  │ Lancar, tajwid baik │
│  2 │ 0001 │ Ahmad Z.   │ Al-Baqarah   │  11   │   20   │  10   │  9.0  │ Sangat baik         │
│  3 │ 0015 │ Fatimah    │ Ali Imran    │   1   │   15   │  15   │  9.8  │ Luar biasa          │
│  4 │ 0007 │ M. Hafidz  │ An-Nisa      │   1   │   25   │  25   │  9.5  │ Excellent           │
│  5 │ 0007 │ M. Hafidz  │ An-Nisa      │  26   │   50   │  25   │  9.0  │ Baik sekali         │
│ .. │ ...  │    ...     │     ...      │  ...  │  ...   │  ...  │  ...  │         ...         │
│ 85 │ 0003 │ Hasan I.   │ Al-Fatihah   │   1   │    7   │   7   │  8.0  │ Perlu latihan lagi  │
├────┴──────┴────────────┴──────────────┴───────┴────────┴───────┴───────┴─────────────────────┤
│                                     RINGKASAN                                                   │
│  Total Ujian Hifdz:        85                                                                  │
│  Total Ayat Dihafalkan:    1,250 ayat                                                         │
│  Rata-rata Nilai:          9.15                                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Features
- **Detail Per Ujian**: Setiap ujian tercatat dengan detail
- **Auto-Calculate**: Total ayat dihitung otomatis
- **Multiple Entries**: Santri bisa punya multiple ujian
- **Progress Tracking**: Mudah track progress hafalan
- **Summary Statistics**: Ringkasan di bawah tabel

### Information Captured
1. **Surah**: Nama surah yang dihafalkan
2. **Range**: Ayat mulai sampai selesai
3. **Total**: Jumlah ayat dalam ujian tersebut
4. **Grade**: Nilai ujian
5. **Notes**: Catatan evaluasi dari ustadz

---

## 📈 Sheet 6: Analisis Mapel

### Layout Preview
```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                        ANALISIS PER MATA PELAJARAN                                │
│                                                                                   │
│ Mata Pelajaran  │ Rata² │ Tertinggi │ Terendah │ Jumlah Nilai │ Standar Deviasi │
├─────────────────┼───────┼───────────┼──────────┼──────────────┼─────────────────┤
│ Bahasa Arab     │  8.65 │    9.8    │    6.2   │      90      │      0.85       │
│ Bahasa Inggris  │  8.50 │    9.7    │    6.3   │      90      │      0.92       │
│ Matematika      │  8.35 │    9.8    │    6.1   │      90      │      1.15       │ ← High Variance
│ Fiqh            │  8.75 │    9.7    │    6.2   │      90      │      0.78       │
│ Tafsir          │  8.45 │    9.5    │    6.5   │      90      │      0.82       │
│ Hadits          │  8.55 │    9.6    │    6.4   │      90      │      0.88       │
│ Aqidah          │  8.60 │    9.5    │    6.6   │      90      │      0.75       │
│ Akhlak          │  8.80 │    9.8    │    7.0   │      90      │      0.65       │ ← Low Variance
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Key Metrics

#### 1. **Rata-rata (Average)**
- Performa overall mapel tersebut
- Tinggi = Mapel dikuasai dengan baik
- Rendah = Perlu attention khusus

#### 2. **Tertinggi (Highest)**
- Best possible performance di mapel ini
- Benchmark untuk santri lain
- Indikator ceiling effect

#### 3. **Terendah (Lowest)**
- Identify struggling students
- Minimum standard yang tercapai
- Alert untuk intervention

#### 4. **Jumlah Nilai (Count)**
- Total entry nilai untuk mapel ini
- Verify data completeness
- Check for missing scores

#### 5. **Standar Deviasi (Std Dev)**
- **Low (< 0.8)**: Konsisten, homogen
- **Medium (0.8-1.2)**: Normal distribution
- **High (> 1.2)**: Bervariasi, perlu investigation

### Insights You Can Get

#### High Standard Deviation
```
Matematika: Std Dev = 1.15
→ Ada gap besar antara santri pandai dan kesulitan
→ Consider: Differentiated instruction, peer tutoring
```

#### Low Standard Deviation
```
Akhlak: Std Dev = 0.65
→ Performa relatif seragam
→ Teaching method efektif untuk semua level
```

#### Low Average with High Std Dev
```
Hypothetical: English Avg = 7.2, Std Dev = 1.5
→ Sebagian santri struggle, sebagian excel
→ Action: Small group instruction, level-based grouping
```

---

## 🎯 Usage Scenarios

### Scenario 1: Rapat Wali Murid
**Sheets to Use:**
1. **Ringkasan**: Present overall class performance
2. **Ranking**: Show where student stands
3. **Nilai Mapel**: Detail academic performance
4. **Tahfidz**: Highlight spiritual progress

### Scenario 2: Teacher Evaluation
**Sheets to Use:**
1. **Analisis Mapel**: Evaluate teaching effectiveness
2. **Nilai Mapel**: Identify learning gaps
3. **Ranking**: See distribution of achievement

### Scenario 3: Academic Planning
**Sheets to Use:**
1. **Analisis Mapel**: Prioritize which subjects need more focus
2. **Ringkasan**: Set targets for next semester
3. **Ranking**: Identify students for remedial/enrichment

### Scenario 4: Progress Reports
**Sheets to Use:**
1. All sheets for comprehensive report
2. Print/share specific sheets as needed
3. Use ranking for motivational purposes

---

## 💡 Pro Tips

### For Parents
1. **Focus on Ranking sheet** untuk quick overview
2. **Check Nilai Mapel** untuk detail per subject
3. **Look at class average** untuk context

### For Teachers
1. **Use Analisis Mapel** untuk evaluate your teaching
2. **Monitor Standar Deviasi** untuk consistency
3. **Track Ranking changes** across semesters

### For Administrators
1. **Ringkasan sheet** untuk board meetings
2. **Analisis Mapel** untuk curriculum decisions
3. **Compare multiple classes** using same format

### For Students
1. **Set goals** based on ranking
2. **Identify weak subjects** from Nilai Mapel
3. **Track tahfidz progress** across time

---

## 📊 Color Coding Reference

### Quick Reference Table
```
┌──────────┬───────────┬──────────────┬─────────────────┐
│  Color   │   Range   │   Meaning    │     Action      │
├──────────┼───────────┼──────────────┼─────────────────┤
│ 🟢 Green │  ≥ 9.0    │ Excellent    │ Maintain/Excel  │
│ 🔵 Blue  │ 8.0-8.9   │ Good         │ Push to A       │
│ 🟡 Yellow│ 7.0-7.9   │ Satisfactory │ Need improvement│
│ 🟠 Orange│ 6.0-6.9   │ Below target │ Remedial needed │
│ 🔴 Red   │  < 6.0    │ Critical     │ Urgent attention│
└──────────┴───────────┴──────────────┴─────────────────┘
```

### Header Colors
```
┌────────────────┬────────────┬─────────────────┐
│     Sheet      │   Color    │    Hex Code     │
├────────────────┼────────────┼─────────────────┤
│ Ringkasan      │ Dark Blue  │ #4472C4         │
│ Ranking        │ Dark Blue  │ #4472C4         │
│ Nilai Mapel    │ Dark Blue  │ #4472C4         │
│ Non-Mapel      │ Green      │ #70AD47         │
│ Tahfidz        │ Orange     │ #F4B084         │
│ Analisis       │ Light Blue │ #5B9BD5         │
└────────────────┴────────────┴─────────────────┘
```

---

## 📱 Mobile Viewing Tips

While Excel on mobile has limitations, here's how to make the most of it:

1. **Use Excel Mobile App** (not browser)
2. **Rotate to landscape** for better viewing
3. **Freeze panes work** on mobile too
4. **Pinch to zoom** for details
5. **Swipe left/right** to see more columns

---

## 🖨️ Printing Tips

### Landscape Orientation
Best for sheets with many columns:
- Nilai Mapel
- Non-Mapel
- Analisis Mapel

### Portrait Orientation
Good for:
- Ringkasan
- Ranking
- Tahfidz

### Print Settings
```
✅ Fit to page
✅ Print gridlines
✅ Print row/column headings (optional)
✅ Repeat header row on each page
```

---

**End of Visual Guide**

*For technical documentation, see EXPORT_EXCEL_DOCUMENTATION.md*






