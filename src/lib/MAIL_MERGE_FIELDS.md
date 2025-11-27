# 📋 Mail Merge Fields Reference

Quick reference untuk semua fields yang tersedia dalam Excel Mail Merge export.

---

## 📊 Field Categories

### 1. METADATA (6 fields)
```
Nomor_Raport          → String  → "2024/2025-1-MAD-001"
Tanggal_Cetak         → String  → "27 November 2024"
Tahun_Akademik        → String  → "2024/2025"
Semester              → String  → "1" atau "2"
Kelas                 → String  → "1 Ula"
Lembaga               → String  → "Madrasah Diniyah"
```

### 2. IDENTITAS SANTRI (7 fields)
```
NIS                   → String  → "00001"
NISN                  → String  → "123456789" atau "-"
Nama_Lengkap          → String  → "Ahmad Zaki Abdullah"
Jenis_Kelamin         → String  → "Laki-laki" / "Perempuan"
Tempat_Lahir          → String  → "Jakarta"
Tanggal_Lahir         → String  → "15 Januari 2010"
Alamat                → String  → "Jl. Merdeka No. 123"
```

### 3. DATA WALI (6 fields)
```
Nama_Ayah             → String  → "Abdullah bin Umar"
Pekerjaan_Ayah        → String  → "Wiraswasta"
Nama_Ibu              → String  → "Fatimah binti Ali"
Pekerjaan_Ibu         → String  → "Ibu Rumah Tangga"
Nama_Wali             → String  → "-" (jika tidak ada)
Hubungan_Wali         → String  → "-" (jika tidak ada)
```

### 4. RANKING & PRESTASI (6 fields)
```
Ranking               → Number  → 1, 2, 3, ...
Total_Santri          → Number  → 30
Ranking_Text          → String  → "1 dari 30"
Rata_Rata_Keseluruhan → String  → "9.75" (2 decimal)
Predikat_Keseluruhan  → String  → "A", "B", "C", "D", "E"
Deskripsi_Predikat    → String  → "Sangat Baik", "Baik", etc
```

### 5. NILAI MATA PELAJARAN (Dynamic - 3 fields per mapel)

**Format Pattern:**
```
Mapel_[NamaMapel]_Nilai       → String → "9.75"
Mapel_[NamaMapel]_Predikat    → String → "A"
Mapel_[NamaMapel]_Deskripsi   → String → "Sangat Baik"
```

**Contoh Mapel:**
```
Mapel_Bahasa_Arab_Nilai          → "9.75"
Mapel_Bahasa_Arab_Predikat       → "A"
Mapel_Bahasa_Arab_Deskripsi      → "Sangat Baik"

Mapel_Bahasa_Inggris_Nilai       → "9.50"
Mapel_Bahasa_Inggris_Predikat    → "A"
Mapel_Bahasa_Inggris_Deskripsi   → "Sangat Baik"

Mapel_Matematika_Nilai           → "8.85"
Mapel_Matematika_Predikat        → "B"
Mapel_Matematika_Deskripsi       → "Baik"

Mapel_Fiqh_Nilai                 → "9.25"
Mapel_Fiqh_Predikat              → "A"
Mapel_Fiqh_Deskripsi             → "Sangat Baik"

Mapel_Tafsir_Nilai               → "9.00"
Mapel_Tafsir_Predikat            → "A"
Mapel_Tafsir_Deskripsi           → "Sangat Baik"

Mapel_Hadits_Nilai               → "8.75"
Mapel_Hadits_Predikat            → "B"
Mapel_Hadits_Deskripsi           → "Baik"

Mapel_Aqidah_Nilai               → "9.10"
Mapel_Aqidah_Predikat            → "A"
Mapel_Aqidah_Deskripsi           → "Sangat Baik"

Mapel_Akhlak_Nilai               → "8.90"
Mapel_Akhlak_Predikat            → "B"
Mapel_Akhlak_Deskripsi           → "Baik"

Mapel_Tajwid_Nilai               → "9.25"
Mapel_Tajwid_Predikat            → "A"
Mapel_Tajwid_Deskripsi           → "Sangat Baik"

Mapel_Tarikh_Islam_Nilai         → "8.50"
Mapel_Tarikh_Islam_Predikat      → "B"
Mapel_Tarikh_Islam_Deskripsi     → "Baik"
```

**Note:**  
- Jumlah mapel bisa berbeda per lembaga
- Nama mapel disesuaikan dengan setup di sistem
- Spasi diganti dengan underscore
- Karakter khusus dihilangkan

### 6. NILAI NON-MAPEL (Dynamic - 2 fields per kategori)

**Format Pattern:**
```
NonMapel_[NamaKategori]           → String → "A" atau "9.5"
NonMapel_[NamaKategori]_Kelompok  → String → "Fiqh", "Akhlak", etc
```

**Contoh Kategori:**
```
NonMapel_Sholat                   → "A"
NonMapel_Sholat_Kelompok          → "Fiqh"

NonMapel_Puasa                    → "B"
NonMapel_Puasa_Kelompok           → "Fiqh"

NonMapel_Zakat                    → "A"
NonMapel_Zakat_Kelompok           → "Fiqh"

NonMapel_Kejujuran                → "A"
NonMapel_Kejujuran_Kelompok       → "Akhlak"

NonMapel_Disiplin                 → "B"
NonMapel_Disiplin_Kelompok        → "Akhlak"

NonMapel_Tanggung_Jawab           → "A"
NonMapel_Tanggung_Jawab_Kelompok  → "Akhlak"

NonMapel_Kerapian                 → "B"
NonMapel_Kerapian_Kelompok        → "Akhlak"

NonMapel_Kerjasama                → "A"
NonMapel_Kerjasama_Kelompok       → "Sosial"
```

### 7. TAHFIDZ (30 fields total)

**Summary Fields (5):**
```
Tahfidz_Total_Ujian    → Number → 5
Tahfidz_Total_Ayat     → Number → 125
Tahfidz_Rata_Rata      → String → "9.25"
Tahfidz_Predikat       → String → "A"
Tahfidz_Surah          → String → "Al-Baqarah, Ali Imran"
```

**Detail 5 Ujian Terakhir (25 fields = 5 per ujian):**

**Ujian 1:**
```
Tahfidz_1_Surah        → String → "Al-Baqarah"
Tahfidz_1_Ayat         → String → "1-10"
Tahfidz_1_Total_Ayat   → String → "10"
Tahfidz_1_Nilai        → String → "9.5"
Tahfidz_1_Keterangan   → String → "Lancar, tajwid baik"
```

**Ujian 2:**
```
Tahfidz_2_Surah
Tahfidz_2_Ayat
Tahfidz_2_Total_Ayat
Tahfidz_2_Nilai
Tahfidz_2_Keterangan
```

**Ujian 3, 4, 5:** (same pattern)

**Note:**  
- Jika ujian < 5, field akan berisi "-"
- Urutan dari yang terbaru

### 8. CATATAN (5 fields - Placeholder)

```
Catatan_Akademik       → String → "" (empty, bisa diisi manual)
Catatan_Sikap          → String → ""
Catatan_Kehadiran      → String → ""
Rekomendasi            → String → ""
Catatan_Wali_Kelas     → String → ""
```

**Usage:**  
Field ini kosong by default. Bisa:
1. Diisi manual di Excel sebelum mail merge
2. Diisi manual di Word setelah merge
3. Di-auto-generate dari sistem (future feature)

### 9. TANDA TANGAN (4 fields - Placeholder)

```
Tanggal_Penyerahan         → String → ""
Nama_Wali_Kelas            → String → ""
Nama_Kepala_Sekolah        → String → ""
Tanda_Tangan_Wali_Santri   → String → ""
```

**Usage:**  
- Diisi manual sebelum print
- Atau biarkan kosong untuk tanda tangan basah

---

## 📐 Field Naming Convention

### Rules:
1. **No Spaces**: Gunakan underscore (_)
   - ✅ `Nama_Lengkap`
   - ❌ `Nama Lengkap`

2. **No Special Characters**: Hanya alphanumeric dan underscore
   - ✅ `Mapel_Bahasa_Arab`
   - ❌ `Mapel_B.Arab`

3. **Case Sensitive**: Huruf besar di awal kata
   - ✅ `Rata_Rata_Keseluruhan`
   - ❌ `rata_rata_keseluruhan`

4. **Clear & Descriptive**: Nama jelas tanpa singkatan
   - ✅ `Tahfidz_Total_Ujian`
   - ❌ `Thfdz_Tot_Uj`

---

## 🔍 Quick Find

### Cara cepat cari field di Excel:

```
1. Buka Excel
2. Ctrl + F
3. Ketik nama field (e.g., "Tahfidz")
4. Find All
```

### Cara cepat insert di Word:

```
1. Mailings → Insert Merge Field
2. Ketik nama field di search box
3. Click field untuk insert
```

---

## 📊 Field Count per Category

| Category | Count | Notes |
|----------|-------|-------|
| Metadata | 6 | Fixed |
| Identitas | 7 | Fixed |
| Data Wali | 6 | Fixed |
| Ranking | 6 | Fixed |
| Mapel | 3×N | N = jumlah mapel |
| Non-Mapel | 2×M | M = jumlah kategori |
| Tahfidz | 30 | Fixed (5 summary + 5×5 detail) |
| Catatan | 5 | Fixed |
| Tanda Tangan | 4 | Fixed |
| **TOTAL** | **70 + 3N + 2M** | Variable |

**Example:**
- 10 mapel × 3 = 30 fields
- 8 kategori × 2 = 16 fields
- Fixed fields = 70
- **Total = 116 fields**

---

## 🎯 Common Use Cases

### 1. Simple Report (Minimal Fields)

```
Nama_Lengkap
NIS
Kelas
Semester
Rata_Rata_Keseluruhan
Predikat_Keseluruhan
Ranking_Text
```

### 2. Full Report (All Academic)

```
All Identitas
All Ranking
All Mapel_*_Nilai
All Mapel_*_Predikat
Tahfidz_Rata_Rata
```

### 3. Parent Meeting Report

```
Nama_Lengkap
Ranking_Text
Rata_Rata_Keseluruhan
All Mapel_*_Nilai
Catatan_Wali_Kelas
Rekomendasi
```

### 4. Certificate Template

```
Nama_Lengkap
NIS
Predikat_Keseluruhan
Ranking
Total_Santri
Tahun_Akademik
Semester
```

---

## 🛠️ Advanced: Dynamic Field Generation

Jika Anda ingin list semua fields programmatically:

```typescript
import { getMailMergeFields } from '@/lib/export-mail-merge'

const fields = getMailMergeFields(nilaiData, categories)

fields.forEach(category => {
  console.log(`\n${category.category}:`)
  category.fields.forEach(field => {
    console.log(`  - ${field}`)
  })
})
```

---

## 💾 Save This Reference

**For Word Template Creators:**
1. Print this page
2. Keep it next to you while creating template
3. Cross-check field names

**For Developers:**
1. Reference this for API/export changes
2. Update when adding new fields
3. Version control this doc

---

## 📝 Notes

- Fields dengan value "-" = data tidak tersedia
- Fields kosong ("") = placeholder untuk diisi
- Numeric fields di-format sebagai string dengan 2 decimal
- Date fields di-format dalam Bahasa Indonesia

---

*Last updated: November 27, 2024*  
*Total fields: 70+ (+ dynamic mapel & non-mapel)*




