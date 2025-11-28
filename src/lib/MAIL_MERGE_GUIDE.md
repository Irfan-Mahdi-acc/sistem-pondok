# 📧 Panduan Mail Merge - Raport ke Microsoft Word

Panduan lengkap menggunakan Export Mail Merge untuk membuat raport otomatis di Microsoft Word.

---

## 📋 Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Cara Export Data](#cara-export-data)
3. [Setup Mail Merge di Word](#setup-mail-merge-di-word)
4. [Field Reference](#field-reference)
5. [Template Word](#template-word)
6. [Tips & Tricks](#tips--tricks)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Pengenalan

### Apa itu Mail Merge?

Mail Merge adalah fitur Microsoft Word yang memungkinkan Anda membuat **dokumen massal** (raport untuk seluruh kelas) dari satu **template** menggunakan data dari Excel.

### Keuntungan Mail Merge

✅ **Efisien**: Buat raport 30+ santri dalam hitungan menit  
✅ **Konsisten**: Design raport sama untuk semua santri  
✅ **Fleksibel**: Mudah update design tanpa re-input data  
✅ **Akurat**: Data langsung dari sistem, minim human error  

### Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sistem     │────▶│  Excel File  │────▶│  Word Mail   │
│   Raport     │     │ (Data Source)│     │    Merge     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   ▼
                                           ┌──────────────┐
                                           │   Raport     │
                                           │   Semua      │
                                           │   Santri     │
                                           └──────────────┘
```

---

## 🔽 Cara Export Data

### Step 1: Buka Halaman Raport

1. Login ke sistem
2. Navigate ke: **Dashboard** → **Academic** → **Nilai Raport**
3. Pilih **Lembaga** dan **Kelas**
4. Pilih **Tahun Akademik** dan **Semester**

### Step 2: Export Mail Merge

1. Klik tombol **"Export Excel"** di kanan atas
2. Pilih **"Mail Merge (Word)"**
   - ✅ Untuk template raport Word
   - ❌ Jangan pilih "Excel Analisis" (itu untuk reporting)
3. File akan ter-download dengan nama:
   ```
   MailMerge_Raport_[Kelas]_Semester[N]_[Date].xlsx
   ```

### Step 3: Verifikasi File Excel

1. Buka file Excel yang sudah ter-download
2. Cek data:
   - ✅ Satu row = satu santri
   - ✅ Semua kolom terisi (atau '-' jika kosong)
   - ✅ Nama kolom jelas (tidak ada spasi, gunakan underscore)

**Contoh Struktur:**

| NIS   | Nama_Lengkap | Mapel_Bahasa_Arab_Nilai | Mapel_Matematika_Nilai | Ranking |
|-------|--------------|-------------------------|------------------------|---------|
| 00001 | Ahmad Zaki   | 9.75                    | 9.50                   | 1       |
| 00002 | Fatimah      | 9.25                    | 8.85                   | 2       |

---

## 🔧 Setup Mail Merge di Word

### Persiapan

**Software yang Dibutuhkan:**
- Microsoft Word (Desktop version, bukan Word Online)
- File Excel hasil export

### Step-by-Step Setup

#### 1. Buat Template Raport Baru

```
File → New → Blank Document
```

#### 2. Design Template Raport

Buat layout raport sesuai kebutuhan:

```
┌─────────────────────────────────────────────────┐
│           PONDOK TADZIMUSSUNNAH                 │
│               RAPORT SANTRI                     │
│                                                 │
│  Nama    : [Nama_Lengkap]                      │
│  NIS     : [NIS]                                │
│  Kelas   : [Kelas]                              │
│  Semester: [Semester]                           │
│  Ranking : [Ranking_Text]                       │
│                                                 │
│  NILAI MATA PELAJARAN                          │
│  ┌──────────────┬────────┬────────────┐       │
│  │ Mata Pelajaran│ Nilai  │ Predikat   │       │
│  ├──────────────┼────────┼────────────┤       │
│  │ Bahasa Arab  │ [...]  │ [...]      │       │
│  │ Matematika   │ [...]  │ [...]      │       │
│  └──────────────┴────────┴────────────┘       │
└─────────────────────────────────────────────────┘
```

**Note:** `[Field_Name]` akan kita replace dengan merge fields nanti

#### 3. Start Mail Merge

```
Mailings → Start Mail Merge → Letters
```

#### 4. Select Data Source

```
Mailings → Select Recipients → Use an Existing List...
→ Browse ke file Excel yang sudah di-export
→ Pilih sheet "Mail Merge Data"
→ OK
```

#### 5. Insert Merge Fields

Untuk setiap data yang ingin ditampilkan:

```
1. Klik dimana field akan ditempatkan
2. Mailings → Insert Merge Field
3. Pilih field dari dropdown (e.g., Nama_Lengkap)
4. Field akan muncul: «Nama_Lengkap»
```

**Contoh:**

```
Nama: «Nama_Lengkap»
NIS: «NIS»
Kelas: «Kelas»
```

#### 6. Preview Results

```
Mailings → Preview Results
→ Gunakan arrow untuk navigate antar santri
→ Check apakah data muncul dengan benar
```

#### 7. Finish & Merge

**Opsi 1: Merge ke Dokumen Baru**
```
Mailings → Finish & Merge → Edit Individual Documents
→ Pilih "All" atau range tertentu
→ OK
→ Word akan buat dokumen baru dengan raport semua santri
```

**Opsi 2: Print Langsung**
```
Mailings → Finish & Merge → Print Documents
→ Pilih printer
→ Print all atau range tertentu
```

**Opsi 3: Merge ke PDF**
```
Mailings → Finish & Merge → Edit Individual Documents
→ Save as PDF
```

---

## 📊 Field Reference

Berikut adalah daftar lengkap fields yang tersedia dalam file Mail Merge Excel:

### 1. Metadata

| Field Name | Contoh | Deskripsi |
|------------|---------|-----------|
| `Nomor_Raport` | 2024/2025-1-PON-001 | Nomor raport unik |
| `Tanggal_Cetak` | 27 November 2024 | Tanggal export |
| `Tahun_Akademik` | 2024/2025 | Tahun akademik |
| `Semester` | 1 | Semester (1 atau 2) |
| `Kelas` | 1 Ula | Nama kelas |
| `Lembaga` | Madrasah Diniyah | Nama lembaga |

### 2. Identitas Santri

| Field Name | Contoh | Deskripsi |
|------------|---------|-----------|
| `NIS` | 00001 | Nomor Induk Santri |
| `NISN` | 123456789 | Nomor Induk Siswa Nasional |
| `Nama_Lengkap` | Ahmad Zaki Abdullah | Nama lengkap santri |
| `Jenis_Kelamin` | Laki-laki | Jenis kelamin |
| `Tempat_Lahir` | Jakarta | Tempat lahir |
| `Tanggal_Lahir` | 15 Januari 2010 | Tanggal lahir |
| `Alamat` | Jl. Merdeka No. 123 | Alamat lengkap |

### 3. Data Wali

| Field Name | Contoh | Deskripsi |
|------------|---------|-----------|
| `Nama_Ayah` | Abdullah bin Umar | Nama ayah |
| `Pekerjaan_Ayah` | Wiraswasta | Pekerjaan ayah |
| `Nama_Ibu` | Fatimah binti Ali | Nama ibu |
| `Pekerjaan_Ibu` | Ibu Rumah Tangga | Pekerjaan ibu |
| `Nama_Wali` | - | Nama wali (jika ada) |
| `Hubungan_Wali` | - | Hubungan dengan wali |

### 4. Ranking & Prestasi

| Field Name | Contoh | Deskripsi |
|------------|---------|-----------|
| `Ranking` | 1 | Ranking angka |
| `Total_Santri` | 30 | Total santri di kelas |
| `Ranking_Text` | 1 dari 30 | Ranking dalam teks |
| `Rata_Rata_Keseluruhan` | 9.75 | Rata-rata nilai (2 desimal) |
| `Predikat_Keseluruhan` | A | Predikat (A-E) |
| `Deskripsi_Predikat` | Sangat Baik | Deskripsi predikat |

### 5. Nilai Mata Pelajaran

Untuk setiap mata pelajaran, ada 3 fields:

**Format:** `Mapel_[NamaMapel]_[Tipe]`

**Contoh untuk Bahasa Arab:**
- `Mapel_Bahasa_Arab_Nilai` → 9.75
- `Mapel_Bahasa_Arab_Predikat` → A
- `Mapel_Bahasa_Arab_Deskripsi` → Sangat Baik

**Mapel yang biasa ada:**
- Bahasa_Arab
- Bahasa_Inggris  
- Matematika
- Fiqh
- Tafsir
- Hadits
- Aqidah
- Akhlak
- Tajwid
- Tarikh_Islam
- dll (sesuai setup lembaga)

### 6. Nilai Non-Mapel (Sikap & Kepribadian)

**Format:** `NonMapel_[NamaKategori]`

**Contoh:**
- `NonMapel_Sholat` → A
- `NonMapel_Puasa` → B
- `NonMapel_Kejujuran` → A
- `NonMapel_Disiplin` → B
- `NonMapel_Tanggung_Jawab` → A
- `NonMapel_Kerapian` → B

### 7. Tahfidz (Hafalan)

#### Summary Fields:

| Field Name | Contoh | Deskripsi |
|------------|---------|-----------|
| `Tahfidz_Total_Ujian` | 5 | Total ujian hifdz |
| `Tahfidz_Total_Ayat` | 125 | Total ayat dihafalkan |
| `Tahfidz_Rata_Rata` | 9.25 | Rata-rata nilai tahfidz |
| `Tahfidz_Predikat` | A | Predikat tahfidz |
| `Tahfidz_Surah` | Al-Baqarah, Ali Imran | Daftar surah |

#### Detail 5 Ujian Terakhir:

**Format:** `Tahfidz_[1-5]_[Field]`

**Ujian 1:**
- `Tahfidz_1_Surah` → Al-Baqarah
- `Tahfidz_1_Ayat` → 1-10
- `Tahfidz_1_Total_Ayat` → 10
- `Tahfidz_1_Nilai` → 9.5
- `Tahfidz_1_Keterangan` → Lancar, tajwid baik

**Ujian 2, 3, 4, 5:** (same format)

### 8. Catatan (Placeholder - bisa diisi manual)

| Field Name | Deskripsi |
|------------|-----------|
| `Catatan_Akademik` | Catatan prestasi akademik |
| `Catatan_Sikap` | Catatan sikap & perilaku |
| `Catatan_Kehadiran` | Catatan kehadiran |
| `Rekomendasi` | Rekomendasi untuk santri |
| `Catatan_Wali_Kelas` | Catatan dari wali kelas |

### 9. Tanda Tangan (Placeholder)

| Field Name | Deskripsi |
|------------|-----------|
| `Tanggal_Penyerahan` | Tanggal penyerahan raport |
| `Nama_Wali_Kelas` | Nama wali kelas |
| `Nama_Kepala_Sekolah` | Nama kepala sekolah |
| `Tanda_Tangan_Wali_Santri` | Area tanda tangan wali |

---

## 📄 Template Word

### Template Sederhana

```word
┌──────────────────────────────────────────────────────────┐
│               PONDOK TADZIMUSSUNNAH                       │
│                   RAPORT SANTRI                           │
│              TAHUN AKADEMIK «Tahun_Akademik»             │
│                SEMESTER «Semester»                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  IDENTITAS SANTRI                                         │
│  ────────────────────────────────────────────────────    │
│  Nomor Raport  : «Nomor_Raport»                          │
│  NIS           : «NIS»                                    │
│  NISN          : «NISN»                                   │
│  Nama Lengkap  : «Nama_Lengkap»                          │
│  Tempat Lahir  : «Tempat_Lahir»                          │
│  Tanggal Lahir : «Tanggal_Lahir»                         │
│  Kelas         : «Kelas»                                  │
│  Lembaga       : «Lembaga»                                │
│                                                           │
│  PRESTASI                                                 │
│  ────────────────────────────────────────────────────    │
│  Ranking Kelas    : «Ranking_Text»                        │
│  Rata-rata Nilai  : «Rata_Rata_Keseluruhan»              │
│  Predikat         : «Predikat_Keseluruhan»               │
│                     («Deskripsi_Predikat»)               │
│                                                           │
│  NILAI MATA PELAJARAN                                     │
│  ────────────────────────────────────────────────────    │
│  ┌───────────────────┬────────┬─────────────────────┐   │
│  │ Mata Pelajaran    │ Nilai  │ Predikat            │   │
│  ├───────────────────┼────────┼─────────────────────┤   │
│  │ Bahasa Arab       │ «...»  │ «...»               │   │
│  │ Bahasa Inggris    │ «...»  │ «...»               │   │
│  │ Matematika        │ «...»  │ «...»               │   │
│  │ Fiqh              │ «...»  │ «...»               │   │
│  │ Tafsir            │ «...»  │ «...»               │   │
│  └───────────────────┴────────┴─────────────────────┘   │
│                                                           │
│  CAPAIAN TAHFIDZ                                          │
│  ────────────────────────────────────────────────────    │
│  Total Ujian    : «Tahfidz_Total_Ujian» kali             │
│  Total Hafalan  : «Tahfidz_Total_Ayat» ayat              │
│  Rata-rata      : «Tahfidz_Rata_Rata»                    │
│  Predikat       : «Tahfidz_Predikat»                     │
│                                                           │
│  CATATAN WALI KELAS                                       │
│  ────────────────────────────────────────────────────    │
│  «Catatan_Wali_Kelas»                                    │
│                                                           │
│                                                           │
│  Mengetahui,                      «Tanggal_Cetak»       │
│                                                           │
│  Wali Santri,             Wali Kelas,                    │
│                                                           │
│                                                           │
│  (_____________)          «Nama_Wali_Kelas»              │
└──────────────────────────────────────────────────────────┘
```

### Tips Design Template

1. **Header & Footer**
   ```
   Insert → Header & Footer
   - Tambahkan logo pondok di header
   - Tambahkan nomor halaman di footer
   ```

2. **Table untuk Nilai**
   ```
   Insert → Table
   - 3 kolom: Mata Pelajaran | Nilai | Predikat
   - Style: Grid Table (pilih yang rapi)
   - Merge fields di cells
   ```

3. **Border & Shading**
   ```
   Design → Page Borders
   - Tambahkan border untuk tampilan lebih formal
   ```

4. **Font & Spacing**
   ```
   Recommended:
   - Font: Times New Roman / Arial
   - Size: 11-12pt untuk body, 14-16pt untuk header
   - Line spacing: 1.15 atau 1.5
   ```

---

## 💡 Tips & Tricks

### 1. Conditional Text

**Tampilkan text berbeda based on nilai:**

```
Mailings → Rules → If...Then...Else...

Contoh:
{ IF «Predikat_Keseluruhan» = "A" "Pertahankan prestasi!" "Tingkatkan lagi!" }
```

### 2. Formatting Numbers

**Format decimal places:**

```
{ MERGEFIELD Rata_Rata_Keseluruhan \# "0.00" }
```

### 3. Empty Fields

**Handle empty fields:**

```
{ IF «NISN» = "-" "" «NISN» }
```

Ini akan menyembunyikan NISN jika kosong.

### 4. Looping Tables

Untuk **tabel nilai** yang dynamic (beda jumlah mapel), gunakan:

1. Buat table di Word
2. Insert merge fields di row pertama
3. Word akan auto-repeat untuk semua mapel

### 5. Save Template

**Simpan template untuk reuse:**

```
File → Save As
→ File Type: Word Template (*.dotx)
→ Nama: Template_Raport_Pondok.dotx
```

Next time:
```
File → Open → [Template]
→ Mailings → Select Recipients → [New Excel file]
→ Preview & Merge
```

### 6. Batch Print

**Print raport tertentu saja:**

```
Mailings → Finish & Merge → Print Documents
→ Choose "From: 1 To: 10" untuk print santri 1-10 saja
```

---

## 🐛 Troubleshooting

### Problem 1: Field tidak muncul di dropdown

**Cause:** Excel file tidak ter-load dengan benar

**Solution:**
1. Pastikan Excel file SUDAH DITUTUP
2. Refresh: Mailings → Edit Recipient List → OK
3. Try insert field lagi

### Problem 2: Data tidak match (salah santri)

**Cause:** Sorting berbeda antara Excel dan Word

**Solution:**
1. Jangan sort data di Excel setelah export
2. Verify Preview Results: check NIS match dengan nama

### Problem 3: Karakter aneh (encoding issue)

**Cause:** Excel save dengan encoding yang salah

**Solution:**
1. Save Excel as → CSV UTF-8
2. Import CSV ke Word mail merge

### Problem 4: Some fields blank

**Cause:** Data di Excel ada yang kosong

**Solution:**
1. Check Excel: pastikan semua cell terisi (atau '-')
2. Use IF statement di Word untuk handle empty

### Problem 5: Merge lambat (banyak data)

**Cause:** Too many records atau template kompleks

**Solution:**
1. Split menjadi beberapa batch (30 santri per batch)
2. Simplify template (kurangi gambar berat)
3. Close program lain untuk free up RAM

### Problem 6: Print ke PDF tidak rapi

**Cause:** Page break di tengah data

**Solution:**
```
1. Pilih paragraph/table
2. Right-click → Paragraph
3. Line and Page Breaks
4. Check: "Keep with next" dan "Keep lines together"
```

---

## 📚 Resources

### Video Tutorial (Search YouTube)
- "Mail Merge Word Excel Tutorial"
- "Cara Membuat Raport Mail Merge"
- "Mail Merge Step by Step"

### Microsoft Official Docs
- https://support.microsoft.com/en-us/office/mail-merge

### Practice Files
Download file contoh:
- Template raport (Word)
- Sample data (Excel)

---

## ✅ Checklist

### Pre-Merge Checklist
- [ ] Data sudah ter-export dari sistem
- [ ] Excel file dibuka dan diverifikasi
- [ ] Template Word sudah dibuat
- [ ] All merge fields sudah di-insert
- [ ] Preview results sudah dicek
- [ ] Page breaks sudah diatur

### Post-Merge Checklist  
- [ ] Total dokumen = total santri
- [ ] Data setiap santri sudah benar
- [ ] Formatting rapi (tidak ada page break aneh)
- [ ] Print preview sudah OK
- [ ] File sudah di-save/backup

---

## 🎉 Hasil Akhir

Setelah mengikuti panduan ini, Anda akan memiliki:

✅ File Excel berisi data lengkap semua santri  
✅ Template Word yang reusable  
✅ Dokumen raport untuk seluruh kelas  
✅ Skill mail merge untuk semester berikutnya  

**Waktu yang dihemat:** 
- Manual: ~5 menit per raport × 30 santri = 150 menit (2.5 jam)
- Mail Merge: ~20 menit total

**Efficiency gain: 87%!** 🚀

---

**Semoga bermanfaat!**  
Jika ada pertanyaan, silakan hubungi tim IT support.

---

*Last updated: November 27, 2024*  
*Version: 1.0*






