# 📊 Enhanced Bookkeeping System - Complete Guide

## 🎯 Overview

Sistem pembukuan yang telah di-enhance dengan fitur:
- **Multi-level**: Pembukuan Umum, Per-Lembaga, dan Custom
- **Access Control**: Role-based access dengan assignment system
- **Collaboration**: Multiple pengurus bisa di-assign ke satu pembukuan
- **Granular Permissions**: MANAGER, EDITOR, VIEWER roles

---

## 🏗️ Struktur Sistem

### 1. **Tipe Pembukuan**

| Tipe | Deskripsi | Contoh |
|------|-----------|---------|
| **UMUM** | Pembukuan pondok secara keseluruhan | Kas Umum Pondok, Kas Operasional |
| **LEMBAGA** | Pembukuan per-lembaga | Kas Lembaga A, Kas Lembaga B |
| **CUSTOM** | Pembukuan untuk kebutuhan khusus | Kas Masjid, Dana Sosial, Dana Qurban |

### 2. **Role Assignment**

| Role | Permissions | Deskripsi |
|------|-------------|-----------|
| **MANAGER** | View, Edit, Assign | Full access + bisa assign pengurus lain |
| **EDITOR** | View, Edit | Bisa lihat dan edit transaksi |
| **VIEWER** | View only | Hanya bisa melihat laporan |

### 3. **User Access**

| User Role | Access Level |
|-----------|--------------|
| **SUPER_ADMIN** | Full access semua pembukuan + delete |
| **BENDAHARA** | Full access semua pembukuan (no delete) |
| **PENGURUS** | Hanya pembukuan yang di-assign |

---

## 📋 Database Schema

### New Models:

#### **Bookkeeping**
```
- id: String (Primary Key)
- name: String (e.g., "Pembukuan Umum Pondok")
- type: String (UMUM/LEMBAGA/CUSTOM)
- lembagaId: String (nullable, for LEMBAGA type)
- description: String (nullable)
- status: String (ACTIVE/ARCHIVED)
- createdBy: String (User ID)
- createdAt: DateTime
- updatedAt: DateTime

Relations:
  - lembaga: Lembaga (optional)
  - assignments: BookkeepingAssignment[]
  - transactions: Transaction[]
```

#### **BookkeepingAssignment**
```
- id: String (Primary Key)
- bookkeepingId: String
- userId: String
- role: String (MANAGER/EDITOR/VIEWER)
- assignedAt: DateTime
- assignedBy: String (nullable)

Relations:
  - bookkeeping: Bookkeeping
  - user: User

Unique: [bookkeepingId, userId]
```

#### **Transaction (Updated)**
```
Added fields:
- bookkeepingId: String (nullable, untuk link ke pembukuan)

New indexes:
  - bookkeepingId
  - date
```

---

## 🚀 Features Implemented

### 1. **Manajemen Pembukuan** (`/dashboard/finance/bookkeeping-management`)

**Features:**
- ✅ View semua pembukuan (filtered by access)
- ✅ Create pembukuan baru (Umum/Lembaga/Custom)
- ✅ Edit pembukuan existing
- ✅ Delete pembukuan (Super Admin only)
- ✅ Assign/remove pengurus
- ✅ Statistics dashboard

**Access:**
- Bendahara: Full access
- Super Admin: Full access + delete
- Pengurus: Hanya yang di-assign

### 2. **Detail Pembukuan** (`/dashboard/finance/bookkeeping/[id]`)

**Features:**
- ✅ View transactions dengan filter
- ✅ Add transaction (jika punya akses edit)
- ✅ Edit transaction (jika punya akses edit)
- ✅ Delete transaction (jika punya akses edit)
- ✅ Summary cards (Income, Expense, Balance)
- ✅ List pengurus yang di-assign
- ✅ Auto-calculate totals

**Access:**
- Tergantung assignment role (MANAGER/EDITOR/VIEWER)

---

## 📁 Files Created/Modified

### **New Files:**

#### Actions:
- `src/actions/bookkeeping-management-actions.ts` - CRUD pembukuan & assignments
- `src/actions/bookkeeping-transaction-actions.ts` - CRUD transaksi per pembukuan

#### Lib/Utils:
- `src/lib/bookkeeping-permissions.ts` - Permission helpers

#### Pages:
- `src/app/dashboard/finance/bookkeeping-management/page.tsx` - List pembukuan
- `src/app/dashboard/finance/bookkeeping/[id]/page.tsx` - Detail pembukuan

#### Components:
- `src/components/bookkeeping/bookkeeping-table.tsx` - Table list pembukuan
- `src/components/bookkeeping/add-bookkeeping-dialog.tsx` - Dialog tambah
- `src/components/bookkeeping/edit-bookkeeping-dialog.tsx` - Dialog edit
- `src/components/bookkeeping/assign-user-dialog.tsx` - Dialog assign pengurus
- `src/components/bookkeeping/add-transaction-dialog.tsx` - Dialog tambah transaksi
- `src/components/bookkeeping/bookkeeping-transaction-table.tsx` - Table transaksi

#### Scripts:
- `scripts/migrate-bookkeeping.ts` - Migration script

### **Modified Files:**
- `prisma/schema.prisma` - Added Bookkeeping & BookkeepingAssignment models
- `src/components/layout/sidebar.tsx` - Added menu link
- `src/auth.ts` - Fixed 0.0.0.0 redirect issue
- `src/app/api/auth/select-role/route.ts` - Fixed 0.0.0.0 redirect issue

---

## 🔐 Access Control Examples

### Example 1: Pembukuan Umum Pondok
```
Type: UMUM
Access:
  - Bendahara Umum (MANAGER)
  - Admin Keuangan (EDITOR)
  - Mudir (VIEWER)
```

### Example 2: Pembukuan Lembaga A
```
Type: LEMBAGA
Lembaga: Lembaga A
Access:
  - Bendahara (MANAGER) - auto access
  - Mudir Lembaga A (EDITOR) - assigned
  - Pengurus Lembaga A (VIEWER) - assigned
```

### Example 3: Kas Masjid
```
Type: CUSTOM
Access:
  - Pengurus Masjid (MANAGER) - assigned
  - Bendahara (MANAGER) - auto access
```

---

## 📖 User Guide

### Untuk Bendahara/Admin:

#### 1. Membuat Pembukuan Baru
1. Buka **Keuangan → Manajemen Pembukuan**
2. Klik **Tambah Pembukuan**
3. Pilih tipe (Umum/Lembaga/Custom)
4. Jika Lembaga, pilih lembaga
5. Isi nama dan deskripsi
6. Klik **Simpan**

#### 2. Assign Pengurus ke Pembukuan
1. Di table pembukuan, klik **⋮ → Kelola Pengurus**
2. Pilih user yang akan di-assign
3. Pilih role (Manager/Editor/Viewer)
4. Klik **Tambah Pengurus**

#### 3. Mengelola Transaksi
1. Klik nama pembukuan untuk detail
2. Klik **Tambah Transaksi**
3. Pilih tipe (Pemasukan/Pengeluaran)
4. Pilih kategori
5. Isi jumlah, tanggal, deskripsi
6. Klik **Simpan**

### Untuk Pengurus (yang di-assign):

#### 1. Melihat Pembukuan Saya
1. Buka **Keuangan → Manajemen Pembukuan**
2. Anda hanya melihat pembukuan yang di-assign

#### 2. Menambah Transaksi (jika role EDITOR/MANAGER)
1. Klik nama pembukuan
2. Klik **Tambah Transaksi**
3. Isi form
4. Simpan

#### 3. Melihat Laporan (semua role)
1. Buka detail pembukuan
2. Lihat summary cards (Income, Expense, Balance)
3. Lihat table transaksi lengkap

---

## 🔄 Workflow Examples

### Workflow 1: Setup Pembukuan Lembaga Baru

1. **Admin/Bendahara:**
   - Buat pembukuan type "LEMBAGA"
   - Pilih lembaga yang sesuai
   - Assign Mudir lembaga sebagai MANAGER
   - Assign Bendahara lembaga sebagai EDITOR

2. **Mudir Lembaga:**
   - Login → pilih role MUDIR
   - Buka Manajemen Pembukuan
   - Lihat pembukuan lembaganya
   - Bisa assign pengurus lain
   - Bisa catat transaksi

### Workflow 2: Pembukuan Custom (Kas Masjid)

1. **Bendahara:**
   - Buat pembukuan type "CUSTOM"
   - Nama: "Kas Masjid"
   - Assign Pengurus Masjid sebagai MANAGER

2. **Pengurus Masjid:**
   - Login → buka Manajemen Pembukuan
   - Hanya lihat "Kas Masjid"
   - Catat semua transaksi masjid
   - Assign helper sebagai EDITOR

---

## 📊 Data Migration

### Default Data Created:
- ✅ Pembukuan Umum Pondok (type: UMUM)
- ✅ Tables: Bookkeeping, BookkeepingAssignment
- ✅ Indexes untuk performance
- ✅ Auto-update triggers

### Migration Files:
- `scripts/migrate-bookkeeping.ts` - Run dengan `npx tsx scripts/migrate-bookkeeping.ts`
- `migrations/add_user_registration.sql` - SQL migration (optional)

---

## 🎨 UI Components

### Management Page
- Stats cards (Total, Umum, Lembaga, Custom)
- Searchable table dengan filters
- Quick actions (View, Edit, Assign, Delete)
- Type & status badges

### Detail Page
- Summary cards (Income, Expense, Balance, Pengurus)
- Assigned users list dengan roles
- Transaction table dengan totals
- Add/Edit/Delete transactions

---

## 🔧 Technical Details

### Permission Checks
```typescript
// Check access level
const access = await getBookkeepingAccess(bookkeepingId)

// Returns:
{
  canView: boolean,
  canEdit: boolean,
  canDelete: boolean,
  canAssign: boolean,
  role: 'MANAGER' | 'EDITOR' | 'VIEWER' | null
}
```

### Data Filtering
```typescript
// Auto-filtered based on user role & assignments
const bookkeepings = await getBookkeepings()

// Bendahara/Super Admin: All bookkeepings
// Pengurus: Only assigned bookkeepings
```

---

## 🚀 How to Use

### 1. **Akses dari Sidebar:**
```
Dashboard
  └── Keuangan
       ├── Laporan Keuangan (existing)
       └── Manajemen Pembukuan (NEW!)
```

### 2. **URLs:**
- List: `/dashboard/finance/bookkeeping-management`
- Detail: `/dashboard/finance/bookkeeping/[id]`

### 3. **Required Roles:**
- Create/Delete: SUPER_ADMIN atau BENDAHARA
- View/Edit: Tergantung assignment

---

## ✅ All Features Implemented

- ✅ Multi-level bookkeeping (Umum/Lembaga/Custom)
- ✅ Assignment system dengan granular permissions
- ✅ Role-based access control
- ✅ Transaction management per bookkeeping
- ✅ Auto-calculate summaries
- ✅ Filter by month/year
- ✅ Assign multiple pengurus per bookkeeping
- ✅ Different access levels (Manager/Editor/Viewer)
- ✅ Beautiful UI dengan stats cards
- ✅ Responsive design

---

## 🎉 Ready to Use!

Silakan login sebagai Bendahara atau Super Admin dan coba fitur baru:

1. Login di http://localhost:3000/login
2. Pilih role yang sesuai
3. Sidebar → Keuangan → **Manajemen Pembukuan**
4. Create pembukuan baru
5. Assign pengurus
6. Mulai catat transaksi!

**Default Pembukuan yang Sudah Ada:**
- ✅ "Pembukuan Umum Pondok" (type: UMUM)

**🎨 Next Features (Optional):**
- Export to Excel/PDF
- Chart visualizations
- Budget planning
- Approval workflow untuk transaksi besar
- Recurring transactions

