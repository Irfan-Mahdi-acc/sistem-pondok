# ⚖️ Sistem Bobot Nilai (Grade Weighting System)

Sistem bobot nilai yang fleksibel dan dapat dikustomisasi per lembaga untuk perhitungan nilai akhir yang lebih akurat.

---

## 📖 Pengenalan

### Apa itu Bobot Nilai?

Bobot nilai adalah **multiplier** yang diterapkan pada setiap jenis ujian untuk menghitung nilai akhir. Ini memungkinkan ujian tertentu memiliki **pengaruh lebih besar** terhadap nilai akhir.

### Contoh Kasus

**Tanpa Bobot** (Simple Average):
```
UAS: 90
UTS: 80  
Harian: 70

Nilai Akhir = (90 + 80 + 70) / 3 = 80.00
```

**Dengan Bobot** (Weighted Average):
```
UAS: 90    (bobot 2.0)  → 90 × 2.0 = 180
UTS: 80    (bobot 1.5)  → 80 × 1.5 = 120
Harian: 70 (bobot 1.0)  → 70 × 1.0 = 70

Total Weighted Score = 180 + 120 + 70 = 370
Total Weight = 2.0 + 1.5 + 1.0 = 4.5

Nilai Akhir = 370 / 4.5 = 82.22
```

**Hasil:** Dengan bobot, UAS yang lebih tinggi memberikan pengaruh lebih besar, sehingga nilai akhir lebih tinggi.

---

## 🎯 Keuntungan

✅ **Lebih Akurat**: UAS lebih penting dari ujian harian  
✅ **Fleksibel**: Setiap lembaga bisa set bobot sendiri  
✅ **Fair**: Santri yang belajar konsisten tapi UAS kurang tidak terlalu terdampak  
✅ **Customizable**: Bisa tambah jenis ujian dan bobot baru  
✅ **Otomatis**: Perhitungan dilakukan otomatis oleh sistem  

---

## 🔧 Cara Kerja

### 1. Database Schema

**Model: `GradeWeight`**

```prisma
model GradeWeight {
  id          String   @id @default(cuid())
  lembagaId   String
  lembaga     Lembaga  @relation(...)
  
  examType    String   // "UAS", "UTS", "HARIAN", etc
  weight      Float    // 2.0, 1.5, 1.0, etc
  order       Int
  isActive    Boolean
  
  createdAt   DateTime
  updatedAt   DateTime
  
  @@unique([lembagaId, examType])
}
```

**Fields:**
- `examType`: Jenis ujian (harus match dengan `Ujian.type`)
- `weight`: Bobot multiplier (0.1 - 10.0)
- `order`: Urutan tampilan
- `isActive`: Apakah bobot ini aktif atau tidak

### 2. Default Weights

Saat lembaga dibuat, sistem auto-create bobot default:

| Jenis Ujian | Bobot | Keterangan |
|-------------|-------|------------|
| UAS         | 2.0   | Ujian Akhir Semester (paling penting) |
| UTS         | 1.5   | Ujian Tengah Semester |
| HARIAN      | 1.0   | Ujian Harian (normal) |
| TUGAS       | 1.0   | Tugas/PR |
| PRAKTEK     | 1.0   | Ujian Praktik |
| LISAN       | 1.0   | Ujian Lisan |

### 3. Calculation Formula

```typescript
weightedAverage = Σ(score × weight) / Σ(weight)
```

**Detail:**
```typescript
function calculateWeightedAverage(grades, weights) {
  let totalWeightedScore = 0
  let totalWeight = 0
  
  grades.forEach(grade => {
    const weight = weights.find(w => w.examType === grade.examType)?.weight || 1.0
    totalWeightedScore += grade.score × weight
    totalWeight += weight
  })
  
  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}
```

---

## 🚀 Penggunaan

### 1. Setup Bobot (Admin)

**Location:** `Dashboard → Settings → Grade Weight Settings`

**Steps:**
1. Pilih lembaga
2. Lihat bobot default yang sudah ter-setup
3. Adjust bobot sesuai kebutuhan:
   - Ubah nilai di kolom "Bobot"
   - Toggle "Aktif" untuk enable/disable
4. Klik "Simpan Perubahan"

**Screenshot Preview:**
```
┌─────────────────────────────────────────────────┐
│ Pengaturan Bobot Nilai                          │
├─────────┬──────────────┬────────┬──────────────┤
│ Aktif   │ Jenis Ujian  │ Bobot  │ Keterangan   │
├─────────┼──────────────┼────────┼──────────────┤
│ [✓]     │ UAS          │ [2.0]  │ 2× penting   │
│ [✓]     │ UTS          │ [1.5]  │ 1.5× penting │
│ [✓]     │ HARIAN       │ [1.0]  │ Normal       │
│ [✓]     │ TUGAS        │ [1.0]  │ Normal       │
│ [ ]     │ LISAN        │ [1.0]  │ Tidak Aktif  │
└─────────┴──────────────┴────────┴──────────────┘
```

### 2. Input Nilai (Guru)

**Nothing changes!** Guru input nilai seperti biasa:

1. Pilih ujian (type: UAS, UTS, etc)
2. Input nilai per santri
3. Simpan

**Sistem otomatis:**
- Apply bobot sesuai jenis ujian
- Calculate weighted average
- Update ranking

### 3. Lihat Hasil (Wali/Santri)

**Di Raport:**
- Nilai per ujian ditampilkan normal
- Nilai akhir = weighted average
- Ranking berdasarkan weighted average

---

## 📊 API Reference

### Actions

#### 1. Get Weights
```typescript
import { getGradeWeights } from '@/actions/grade-weight-actions'

const weights = await getGradeWeights(lembagaId)
// Returns: GradeWeight[]
```

#### 2. Update Weight
```typescript
import { updateGradeWeight } from '@/actions/grade-weight-actions'

await updateGradeWeight(weightId, {
  weight: 2.5,
  isActive: true
})
```

#### 3. Batch Update
```typescript
import { batchUpdateGradeWeights } from '@/actions/grade-weight-actions'

await batchUpdateGradeWeights(lembagaId, [
  { id: '...', examType: 'UAS', weight: 2.0, order: 1, isActive: true },
  { id: '...', examType: 'UTS', weight: 1.5, order: 2, isActive: true }
])
```

#### 4. Reset to Default
```typescript
import { resetToDefaultWeights } from '@/actions/grade-weight-actions'

await resetToDefaultWeights(lembagaId)
// Deletes all current weights and recreates defaults
```

#### 5. Calculate Weighted Average
```typescript
import { calculateWeightedAverage } from '@/actions/grade-weight-actions'

const average = await calculateWeightedAverage(lembagaId, [
  { score: 90, examType: 'UAS' },
  { score: 85, examType: 'UTS' },
  { score: 80, examType: 'HARIAN' }
])
// Returns: number (weighted average)
```

### Helper Functions

#### From `src/lib/grade-calculations.ts`

```typescript
import {
  calculateWeightedAverage,
  calculateSimpleAverage,
  getGradePredicate,
  getPredicateDescription,
  groupByMapelWithWeights,
  calculateRankingWithWeights,
  formatNumber
} from '@/lib/grade-calculations'

// Calculate weighted average
const avg = calculateWeightedAverage(grades, weights)

// Get predicate
const predicate = getGradePredicate(8.5) // Returns: 'B'

// Calculate ranking with weights
const ranking = calculateRankingWithWeights(students, nilaiData, weights)
```

---

## 💡 Use Cases

### Use Case 1: Standard School Weighting

**Scenario:** UAS dan UTS lebih penting dari ujian harian

**Setup:**
```
UAS:     2.0  (double weight)
UTS:     1.5  (1.5x weight)
HARIAN:  1.0  (normal)
TUGAS:   1.0  (normal)
```

### Use Case 2: Practice-Heavy Program

**Scenario:** Praktik dan tugas sama pentingnya dengan ujian

**Setup:**
```
UAS:     1.5
UTS:     1.5
PRAKTEK: 1.5
TUGAS:   1.5
HARIAN:  1.0
```

### Use Case 3: Continuous Assessment

**Scenario:** Ujian harian lebih penting dari ujian besar

**Setup:**
```
HARIAN:  2.0  (emphasis on daily performance)
TUGAS:   1.5
UTS:     1.0
UAS:     1.0
```

### Use Case 4: Disable Certain Exam Types

**Scenario:** Lembaga tidak pakai ujian lisan

**Setup:**
```
LISAN: isActive = false
```

Nilai dari ujian lisan tidak akan dihitung dalam average.

---

## 🔄 Migration & Backward Compatibility

### For Existing Data

**Saat update sistem:**
1. Nilai lama (tanpa bobot) tetap tersimpan
2. Pertama kali load, default weights di-create
3. Nilai di-recalculate otomatis dengan bobot default
4. Ranking mungkin berubah (karena sekarang weighted)

### Fallback Behavior

**Jika lembaga belum setup bobot:**
- Sistem auto-create default weights
- Calculation proceed normally

**Jika exam type tidak punya weight config:**
- Default weight = 1.0 (normal)
- Tidak error, calculation tetap jalan

---

## 📈 Impact on Reports

### Raport

**Before:**
```
Nilai Akhir: Simple average dari semua ujian
```

**After:**
```
Nilai Akhir: Weighted average berdasarkan bobot
```

### Excel Export

**Mail Merge:**
- Field tetap sama
- Nilai sudah ter-calculate dengan bobot

**Excel Analisis:**
- Sheet "Analisis Mapel" include weighted averages
- Sheet "Ranking" based on weighted scores

### Statistik

- Class average: weighted
- Standard deviation: calculated from weighted averages
- Min/max: from weighted averages

---

## 🎨 UI Components

### GradeWeightSettings

**Location:** `src/components/settings/grade-weight-settings.tsx`

**Props:**
```typescript
{
  lembagaId: string
  lembagaName: string
}
```

**Features:**
- Table editor untuk bobot
- Real-time example calculation
- Save/Reset buttons
- Default weights reference
- Warning alerts

**Usage:**
```tsx
<GradeWeightSettings 
  lembagaId="cm..." 
  lembagaName="Madrasah Diniyah" 
/>
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create lembaga baru → Check default weights created
- [ ] Edit weight value → Save → Verify calculation changes
- [ ] Disable weight → Check ujian type not counted
- [ ] Reset to default → Verify weights restored
- [ ] Input nilai dengan jenis ujian berbeda
- [ ] Check raport → Weighted average displayed correctly
- [ ] Export Excel → Weighted values correct
- [ ] Multiple lembaga → Each has own weights

### Edge Cases

1. **No weights configured**: Auto-create defaults
2. **All weights disabled**: Fallback to simple average
3. **Unknown exam type**: Use weight = 1.0
4. **Weight = 0**: Grade not counted
5. **Very high weight (10.0)**: Works but warn user
6. **Negative weight**: Validation prevents this

---

## 🚨 Important Notes

### For Administrators

⚠️ **Changing weights affects:**
- All nilai calculations in that lembaga
- Student rankings
- Raport values
- Export data

💡 **Best practices:**
- Set weights at start of semester
- Don't change mid-semester
- Inform teachers about changes
- Test dengan sample data first

### For Developers

⚠️ **Always use weighted calculations:**
```typescript
// ❌ DON'T: Simple average
const avg = scores.reduce((a, b) => a + b, 0) / scores.length

// ✅ DO: Weighted average
const avg = calculateWeightedAverage(grades, weights)
```

⚠️ **Remember to load weights:**
```typescript
const weights = await getGradeWeights(lembagaId)
```

⚠️ **Handle fallback:**
```typescript
const weight = weightConfig?.weight || 1.0 // fallback to 1.0
```

---

## 📚 Related Documentation

- [Grade Calculations](./grade-calculations.ts) - Helper functions
- [Grade Weight Actions](../actions/grade-weight-actions.ts) - Server actions
- [Prisma Schema](../../prisma/schema.prisma) - Database model

---

## 🔮 Future Enhancements

### Potential Features

1. **Time-based Weights**
   - Different weights per semester
   - Progressive weighting (later exams more important)

2. **Subject-specific Weights**
   - Different weights per mata pelajaran
   - Example: Praktik 2× untuk Praktek subjects

3. **Custom Formulas**
   - Allow custom calculation formulas
   - Example: "Best 3 out of 5"

4. **Weight Templates**
   - Save weight configurations as templates
   - Apply template to multiple lembagas

5. **Weight History**
   - Track changes to weights
   - Audit trail

6. **What-If Calculator**
   - Simulate grade outcomes with different weights
   - Help students understand impact

---

## 📞 Support

**For Questions:**
- Check this documentation
- Review code examples
- Contact development team

**For Issues:**
- Check browser console for errors
- Verify weight configuration
- Test with sample data

---

**Last Updated:** November 27, 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready

---

*Sistem Bobot Nilai - Making grading fairer and more flexible* ⚖️





