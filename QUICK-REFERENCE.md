# ⚡ Quick Reference Guide
## Sistem Web Pondok Tadzimussunnah

> Cheat sheet untuk development sehari-hari

---

## 🚀 Start Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 📁 Where to Put Files

| Type | Location | Example |
|------|----------|---------|
| Pages | `src/app/[path]/page.tsx` | `src/app/dashboard/santri/page.tsx` |
| Server Actions | `src/actions/[entity]-actions.ts` | `src/actions/santri-actions.ts` |
| Components | `src/components/[feature]/` | `src/components/santri/` |
| UI Components | `src/components/ui/` | `src/components/ui/button.tsx` |
| Utilities | `src/lib/` | `src/lib/utils.ts` |
| Types | `src/types/` | `src/types/next-auth.d.ts` |
| Database | `prisma/schema.prisma` | - |

---

## 🏷️ Naming Cheat Sheet

```typescript
// Files
add-santri-dialog.tsx       ✅
AddSantriDialog.tsx        ❌ (unless component export)
santri-actions.ts          ✅
SantriActions.ts           ❌

// Components
export function AddSantriDialog()  ✅
export function addSantriDialog()  ❌

// Functions
getSantriList()            ✅
get_santri_list()          ❌
GetSantriList()            ❌

// Variables
const santriList           ✅
const SantriList           ❌
const santri_list          ❌

// Types/Interfaces
interface SantriData       ✅
type UserRole              ✅
```

---

## 🧩 Component Templates

### Server Component (Page):
```typescript
// src/app/dashboard/santri/page.tsx
import { getSantriList } from "@/actions/santri-actions"

export default async function SantriPage() {
  const santriList = await getSantriList()
  
  return (
    <div>
      <h1>Santri List</h1>
      {/* ... */}
    </div>
  )
}
```

### Client Component (Dialog):
```typescript
"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function AddSantriDialog() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* ... */}
    </Dialog>
  )
}
```

---

## ⚡ Server Actions Template

```typescript
// src/actions/santri-actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getSantriList() {
  const list = await prisma.santri.findMany()
  return list
}

export async function createSantri(formData: FormData) {
  try {
    const name = formData.get("name") as string
    
    const santri = await prisma.santri.create({
      data: { fullName: name }
    })
    
    revalidatePath("/dashboard/santri")
    return { success: true, data: santri }
  } catch (error) {
    return { success: false, error: "Failed" }
  }
}
```

---

## 🗄️ Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_field_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Format schema
npx prisma format
```

---

## 📝 Git Commands

```bash
# Daily workflow
git status
git add .
git commit -m "Description of changes"
git push origin main

# Create branch
git checkout -b feature/feature-name

# Merge branch
git checkout main
git merge feature/feature-name

# View history
git log --oneline

# Undo changes
git reset --hard HEAD

# Pull latest
git pull origin main
```

---

## 🔄 Common Actions Patterns

### CRUD Operations:

```typescript
// GET LIST
export async function getEntityList() {
  return await prisma.entity.findMany({
    orderBy: { createdAt: "desc" }
  })
}

// GET ONE
export async function getEntityById(id: string) {
  return await prisma.entity.findUnique({
    where: { id }
  })
}

// CREATE
export async function createEntity(data: FormData) {
  try {
    const entity = await prisma.entity.create({ data: /* ... */ })
    revalidatePath("/path")
    return { success: true, data: entity }
  } catch (error) {
    return { success: false, error: "Failed" }
  }
}

// UPDATE
export async function updateEntity(id: string, data: FormData) {
  try {
    const entity = await prisma.entity.update({
      where: { id },
      data: /* ... */
    })
    revalidatePath("/path")
    return { success: true, data: entity }
  } catch (error) {
    return { success: false, error: "Failed" }
  }
}

// DELETE
export async function deleteEntity(id: string) {
  try {
    await prisma.entity.delete({ where: { id } })
    revalidatePath("/path")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed" }
  }
}
```

---

## 🎨 Common Imports

```typescript
// React
import { useState, useEffect } from "react"

// Next.js
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Form
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Icons
import { Pencil, Trash, Plus, X } from "lucide-react"

// Database
import { prisma } from "@/lib/prisma"

// Utils
import { cn } from "@/lib/utils"
```

---

## 🔐 Security Checklist

```typescript
// ✅ Server Actions
"use server" at top
Try-catch all operations
Validate inputs
Check authentication
revalidatePath after mutations
Return consistent format { success, data?, error? }

// ✅ Environment Variables
Never commit .env
Use process.env.VARIABLE_NAME
Prefix public vars with NEXT_PUBLIC_

// ✅ Passwords
Hash with bcrypt before saving
Never return in API responses
Never log passwords

// ✅ File Uploads
Validate file size
Validate file type
Sanitize filename
```

---

## 🐛 Debugging Tips

```typescript
// Server Actions
console.log("Debug:", data) // Shows in terminal

// Client Components  
console.log("Debug:", data) // Shows in browser console

// Check Prisma queries
npx prisma studio

// Check database
sqlite3 prisma/dev.db
SELECT * FROM Santri;

// Check build errors
npm run build

// Clear Next.js cache
rm -rf .next
npm run dev
```

---

## ⚠️ Common Mistakes to Avoid

```typescript
// ❌ Forgot "use client" for interactive components
// Add at top of file with useState, onClick, etc.
"use client"

// ❌ Forgot "use server" for server actions
// Add at top of actions file
"use server"

// ❌ Forgot to revalidatePath after mutation
revalidatePath("/dashboard/santri")

// ❌ Not handling async properly
const data = getSantriList() // ❌ Missing await
const data = await getSantriList() // ✅

// ❌ Wrong import path
import { Button } from "components/ui/button" // ❌
import { Button } from "@/components/ui/button" // ✅

// ❌ Not checking if data exists
data.map() // ❌ Could be null
data?.map() // ✅ Safe
```

---

## 📦 Backup Commands

```powershell
# Backup database
.\backup-database.ps1

# Backup everything
.\backup-all.ps1

# Setup auto backup
.\schedule-backup.ps1

# Git commit
git add .
git commit -m "Backup before changes"
```

---

## 🚨 Emergency Commands

```bash
# Server won't start
rm -rf .next node_modules
npm install
npm run dev

# Database is corrupt
Copy-Item "backups\database\latest.db" -Destination "prisma\dev.db" -Force

# Code is broken
git reset --hard HEAD
git pull origin main

# Lost changes
git reflog
git reset --hard HEAD@{1}
```

---

## 📞 Quick Links

- **Full Rules:** `PROJECT-RULES.md`
- **Git Guide:** `GIT-WORKFLOW.md`
- **Backup Guide:** `BACKUP-STRATEGY.md`
- **Protection Guide:** `PROTECT-YOUR-PROGRESS.md`

---

**Keep this file handy for daily development! 🚀**


