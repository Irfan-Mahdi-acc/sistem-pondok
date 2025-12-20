# 📖 Project Rules & Coding Standards
## Sistem Web Pondok Tadzimussunnah

> **Last Updated:** December 20, 2025  
> **Version:** 2.0.0 - VPS Production Ready

---

## 📋 Table of Contents

1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Project Structure](#project-structure)
3. [Naming Conventions](#naming-conventions)
4. [Coding Standards](#coding-standards)
5. [Component Patterns](#component-patterns)
6. [Server Actions Patterns](#server-actions-patterns)
7. [Database Conventions (Prisma)](#database-conventions-prisma)
8. [Git Workflow](#git-workflow)
9. [Security Rules](#security-rules)
10. [VPS Deployment & Production Environment](#vps-deployment--production-environment)
11. [Performance Guidelines](#performance-guidelines)
12. [Documentation Requirements](#documentation-requirements)
13. [Testing Requirements](#testing-requirements)

---

## 🛠️ Tech Stack & Architecture

### Core Technologies:
- **Framework:** Next.js 16.0.3 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 4 + Shadcn/ui
- **Database:** 
  - Development: SQLite + Prisma ORM 5.22.0
  - Production: PostgreSQL + Prisma ORM 5.22.0
- **Authentication:** NextAuth v5 (Beta)
- **Form Validation:** React Hook Form + Zod

### Architecture Pattern:
- **Frontend:** React Server Components (RSC) + Client Components
- **Backend:** Next.js Server Actions
- **Database:** Prisma ORM with migrations
- **State Management:** React Server Components + URL State
- **File Structure:** Feature-based organization

### Production Stack:
- **Hosting:** VPS (Ubuntu 22.04 LTS)
- **Domain:** siakad.tsn.ponpes.id
- **Process Manager:** PM2 (Cluster mode)
- **Web Server:** Nginx (Reverse Proxy)
- **Database:** PostgreSQL 14+
- **SSL:** Let's Encrypt (Certbot)
- **Security:** UFW Firewall, Fail2Ban, SSH Hardening
- **Deployment:** GitHub Actions (Auto-deploy)

---

## 📁 Project Structure

```
📦 Sistem Web Pondok Tadzimussunnah/
├── 📁 prisma/                    # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   ├── seed.ts                   # Seed data
│   └── dev.db                    # SQLite database (NOT committed)
│
├── 📁 public/                    # Static assets
│   └── uploads/                  # User uploads (NOT committed)
│
├── 📁 src/
│   ├── 📁 actions/               # Server Actions (Backend logic)
│   │   ├── santri-actions.ts
│   │   ├── nilai-actions.ts
│   │   └── ...
│   │
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   ├── 📁 dashboard/         # Dashboard pages
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── 📁 [feature]/     # Feature pages
│   │   └── 📁 api/               # API routes (minimal usage)
│   │
│   ├── 📁 components/            # React components
│   │   ├── 📁 [feature]/         # Feature components
│   │   │   ├── add-[entity]-dialog.tsx
│   │   │   ├── edit-[entity]-dialog.tsx
│   │   │   ├── [entity]-table.tsx
│   │   │   └── [entity]-form.tsx
│   │   ├── 📁 ui/                # Shadcn/ui components
│   │   ├── 📁 layout/            # Layout components
│   │   └── theme-provider.tsx
│   │
│   ├── 📁 lib/                   # Utilities & helpers
│   │   ├── utils.ts              # General utilities
│   │   ├── prisma.ts             # Prisma client
│   │   ├── encryption.ts         # Security utilities
│   │   ├── excel-export.ts       # Export utilities
│   │   └── *.md                  # Documentation
│   │
│   ├── 📁 types/                 # TypeScript type definitions
│   │   ├── next-auth.d.ts
│   │   └── *.d.ts
│   │
│   └── auth.ts                   # NextAuth configuration
│
├── 📁 scripts/                   # Utility scripts
├── 📁 backups/                   # Local backups (NOT committed)
│
├── .env                          # Environment variables (NOT committed)
├── .gitignore                    # Git ignore rules
├── middleware.ts                 # Next.js middleware
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── *.md                          # Documentation files
```

---

## 🏷️ Naming Conventions

### Files & Folders:

#### ✅ DO:
```
kebab-case untuk files:
  - santri-actions.ts
  - add-santri-dialog.tsx
  - nilai-raport-table.tsx
  
PascalCase untuk components:
  - AddSantriDialog
  - NilaiRaporTable
  - UserTable

lowercase untuk folders:
  - /dashboard
  - /components/santri
  - /actions
```

#### ❌ DON'T:
```
❌ SantriActions.ts        (PascalCase untuk non-component files)
❌ Add_Santri_Dialog.tsx   (snake_case)
❌ addSantriDialog.tsx     (camelCase untuk component files)
❌ /Dashboard              (PascalCase folders)
```

---

### Components:

#### Pattern:
```typescript
// Component files: PascalCase with descriptive names
AddSantriDialog.tsx
EditSantriDialog.tsx
SantriTable.tsx
SantriListWrapper.tsx

// Component names match file names
export function AddSantriDialog() { }
export function SantriTable() { }
```

#### ✅ Component Naming Patterns:
```
Add[Entity]Dialog      - Dialog untuk menambah data
Edit[Entity]Dialog     - Dialog untuk edit data
[Entity]Table          - Table component
[Entity]Form           - Form component
[Entity]List           - List/wrapper component
[Entity]Stats          - Statistics component
[Entity]Card           - Card display component
```

---

### Server Actions:

#### Pattern:
```typescript
// File: [entity]-actions.ts
santri-actions.ts
nilai-actions.ts
kelas-actions.ts

// Function names: Verb + Entity + Optional descriptor
getSantriList()
createSantri()
updateSantri()
deleteSantri()
getSantriById()
getSantriWithDetails()
```

#### ✅ Action Naming Patterns:
```
get[Entity]List()         - Fetch list/array
get[Entity]ById()         - Fetch single by ID
get[Entity]With[Detail]() - Fetch with relations
create[Entity]()          - Create new
update[Entity]()          - Update existing
delete[Entity]()          - Delete (soft or hard)
```

---

### Variables & Constants:

```typescript
// ✅ DO:
const santriList = await getSantriList()
const isLoading = false
const MAX_FILE_SIZE = 5 * 1024 * 1024
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Types/Interfaces: PascalCase
interface SantriData { }
type UserRole = "ADMIN" | "USTADZ"

// ❌ DON'T:
const SantriList = []           // PascalCase for variables
const is_loading = false        // snake_case
const maxfilesize = 5000000     // no separation
```

---

### Database (Prisma):

```prisma
// Models: PascalCase singular
model Santri { }
model Lembaga { }
model Nilai { }

// Fields: camelCase
model Santri {
  id         String
  fullName   String  // NOT full_name
  birthDate  DateTime
  createdAt  DateTime
}

// Relations: descriptive names
model Santri {
  kelas         Kelas    @relation(fields: [kelasId], references: [id])
  kelasId       String
  nilaiList     Nilai[]  // Array suffix with "List"
}
```

---

## 💻 Coding Standards

### TypeScript:

#### ✅ DO:
```typescript
// Use explicit types for function parameters
export async function getSantriById(id: string): Promise<Santri | null> {
  return await prisma.santri.findUnique({ where: { id } })
}

// Use type inference for simple variables
const santriCount = await prisma.santri.count() // inferred as number

// Use interfaces for object shapes
interface SantriFormData {
  fullName: string
  birthDate: Date
  kelasId: string
}

// Use type for unions/primitives
type UserRole = "ADMIN" | "USTADZ" | "SANTRI"
type Status = "active" | "inactive"
```

#### ❌ DON'T:
```typescript
// ❌ Using 'any' type
async function getData(id: any): Promise<any> { }

// ❌ No return type for complex functions
async function processSantri(data) { }

// ❌ Implicit any in destructuring
const { name, age } = data // What is data?
```

---

### React Components:

#### ✅ Server Components (Default):
```typescript
// pages or components that fetch data
// NO "use client" directive needed

import { getSantriList } from "@/actions/santri-actions"

export default async function SantriPage() {
  const santriList = await getSantriList()
  
  return (
    <div>
      <SantriTable data={santriList} />
    </div>
  )
}
```

#### ✅ Client Components (When needed):
```typescript
"use client" // At the top!

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AddSantriDialog() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Client-side interactions: onClick, onChange, useState, useEffect
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* ... */}
    </Dialog>
  )
}
```

#### When to use "use client":
- ✅ Forms with state/validation
- ✅ Dialogs/Modals
- ✅ Interactive UI (onClick, onChange)
- ✅ Browser APIs (localStorage, window)
- ✅ React hooks (useState, useEffect, etc.)
- ❌ Simple display components
- ❌ Pages that only fetch & display data

---

### Component Structure:

```typescript
"use client" // If client component

// 1. Imports - grouped & sorted
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

import { createSantri } from "@/actions/santri-actions"
import { santriSchema } from "@/lib/schemas"

// 2. Types/Interfaces
interface AddSantriDialogProps {
  onSuccess?: () => void
}

// 3. Component
export function AddSantriDialog({ onSuccess }: AddSantriDialogProps) {
  // 3a. State & hooks
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 3b. Form
  const form = useForm({ /* ... */ })
  
  // 3c. Handlers
  async function onSubmit(data: any) {
    setIsLoading(true)
    // ... logic
    setIsLoading(false)
  }
  
  // 3d. Render
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* JSX */}
    </Dialog>
  )
}
```

---

### Error Handling:

#### ✅ Server Actions:
```typescript
export async function createSantri(formData: FormData) {
  try {
    // Validation
    const validatedData = santriSchema.parse(/* ... */)
    
    // Database operation
    const santri = await prisma.santri.create({
      data: validatedData
    })
    
    revalidatePath('/dashboard/santri')
    return { success: true, data: santri }
    
  } catch (error) {
    console.error("Error creating santri:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Gagal menambah santri" 
    }
  }
}
```

#### ✅ Client Components:
```typescript
async function handleSubmit(data: FormData) {
  setIsLoading(true)
  
  try {
    const result = await createSantri(data)
    
    if (result.success) {
      toast.success("Santri berhasil ditambahkan")
      setIsOpen(false)
      onSuccess?.()
    } else {
      toast.error(result.error || "Terjadi kesalahan")
    }
  } catch (error) {
    toast.error("Gagal menambah santri")
    console.error(error)
  } finally {
    setIsLoading(false)
  }
}
```

---

## 🧩 Component Patterns

### Dialog/Modal Pattern:

```typescript
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { createEntity } from "@/actions/entity-actions"

// Schema
const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  // ... other fields
})

interface AddEntityDialogProps {
  onSuccess?: () => void
  triggerButton?: React.ReactNode
}

export function AddEntityDialog({ onSuccess, triggerButton }: AddEntityDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" }
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const result = await createEntity(values)
    
    if (result.success) {
      form.reset()
      setIsOpen(false)
      onSuccess?.()
    }
    setIsLoading(false)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || <Button>Add Entity</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Entity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Submit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Table Pattern:

```typescript
"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"

import { EditEntityDialog } from "./edit-entity-dialog"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

interface EntityTableProps {
  data: Entity[]
  onUpdate?: () => void
}

export function EntityTable({ data, onUpdate }: EntityTableProps) {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  function handleEdit(entity: Entity) {
    setSelectedEntity(entity)
    setIsEditOpen(true)
  }
  
  function handleDelete(entity: Entity) {
    setSelectedEntity(entity)
    setIsDeleteOpen(true)
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedEntity && (
        <>
          <EditEntityDialog
            entity={selectedEntity}
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSuccess={onUpdate}
          />
          <DeleteConfirmDialog
            isOpen={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={async () => {
              // Delete logic
              onUpdate?.()
            }}
          />
        </>
      )}
    </>
  )
}
```

---

## ⚡ Server Actions Patterns

### File Structure:
```typescript
// File: src/actions/[entity]-actions.ts

"use server" // At the top!

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

// --- READ Operations ---

export async function getEntityList() {
  try {
    const list = await prisma.entity.findMany({
      orderBy: { createdAt: "desc" },
      include: { /* relations if needed */ }
    })
    return list
  } catch (error) {
    console.error("Error fetching entities:", error)
    return []
  }
}

export async function getEntityById(id: string) {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: { /* relations */ }
    })
    return entity
  } catch (error) {
    console.error("Error fetching entity:", error)
    return null
  }
}

// --- CREATE Operation ---

export async function createEntity(formData: FormData) {
  try {
    // 1. Extract & validate data
    const name = formData.get("name") as string
    if (!name) throw new Error("Name is required")
    
    // 2. Create in database
    const entity = await prisma.entity.create({
      data: { name }
    })
    
    // 3. Revalidate cache
    revalidatePath("/dashboard/entities")
    
    // 4. Return success
    return { success: true, data: entity }
    
  } catch (error) {
    console.error("Error creating entity:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create" 
    }
  }
}

// --- UPDATE Operation ---

export async function updateEntity(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    
    const entity = await prisma.entity.update({
      where: { id },
      data: { name }
    })
    
    revalidatePath("/dashboard/entities")
    return { success: true, data: entity }
    
  } catch (error) {
    console.error("Error updating entity:", error)
    return { success: false, error: "Failed to update" }
  }
}

// --- DELETE Operation ---

export async function deleteEntity(id: string) {
  try {
    await prisma.entity.delete({
      where: { id }
    })
    
    revalidatePath("/dashboard/entities")
    return { success: true }
    
  } catch (error) {
    console.error("Error deleting entity:", error)
    return { success: false, error: "Failed to delete" }
  }
}
```

### Action Best Practices:

✅ **DO:**
- Always use `"use server"` directive
- Always wrap in try-catch
- Always return consistent response format: `{ success: boolean, data?, error? }`
- Always revalidate cache after mutations
- Log errors to console
- Validate input data
- Use meaningful error messages

❌ **DON'T:**
- Don't expose sensitive data in error messages
- Don't return raw database errors to client
- Don't forget to revalidatePath after mutations
- Don't use actions for simple data fetching (use direct prisma in server components)

---

## 🗄️ Database Conventions (Prisma)

### Schema Rules:

```prisma
// ✅ DO:

// 1. Model names: PascalCase singular
model Santri { }
model Lembaga { }

// 2. Fields: camelCase
model Santri {
  id           String   @id @default(cuid())
  fullName     String   // NOT full_name or FullName
  birthDate    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// 3. Relations: descriptive names
model Santri {
  // Foreign key
  kelasId    String
  // Relation
  kelas      Kelas    @relation(fields: [kelasId], references: [id])
  
  // One-to-many: use plural with "List" suffix
  nilaiList  Nilai[]
  
  // One-to-one: use singular
  userProfile User?
}

// 4. Enums: PascalCase with SCREAMING_SNAKE_CASE values
enum JenisKelamin {
  LAKI_LAKI
  PEREMPUAN
}

// 5. Always include metadata
model Entity {
  id        String   @id @default(cuid())
  // ... fields ...
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 6. Soft delete (if needed)
model Entity {
  deletedAt DateTime?
  isDeleted Boolean  @default(false)
}
```

---

### Migration Guidelines:

```bash
# ✅ DO:
# 1. Create migration with descriptive name
npx prisma migrate dev --name add_student_status_field

# 2. Always review migration SQL before applying
# Check: prisma/migrations/[timestamp]_add_student_status_field/migration.sql

# 3. Test migration in development first
npm run dev

# 4. Commit migration files to Git
git add prisma/migrations/
git commit -m "Add student status field migration"

# ❌ DON'T:
# - Don't edit migration files manually after creation
# - Don't delete migrations that have been applied
# - Don't migrate directly in production (use migrate deploy)
```

---

### Query Best Practices:

```typescript
// ✅ DO:

// 1. Use select for specific fields (performance)
const santri = await prisma.santri.findMany({
  select: {
    id: true,
    fullName: true,
    kelas: {
      select: { name: true }
    }
  }
})

// 2. Use include for relations
const santri = await prisma.santri.findUnique({
  where: { id },
  include: {
    kelas: true,
    nilaiList: true
  }
})

// 3. Use transactions for related operations
await prisma.$transaction(async (tx) => {
  await tx.santri.create({ /* ... */ })
  await tx.nilai.create({ /* ... */ })
})

// 4. Use pagination for large datasets
const santriList = await prisma.santri.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: "desc" }
})

// ❌ DON'T:

// - Don't fetch all data without pagination
const allSantri = await prisma.santri.findMany() // Could be thousands!

// - Don't use nested includes excessively (N+1 problem)
include: {
  kelas: {
    include: {
      lembaga: {
        include: { /* ... */ }
      }
    }
  }
}

// - Don't forget error handling
const santri = await prisma.santri.findUnique({ where: { id } }) // Could throw!
```

---

## 📝 Git Workflow

### Branch Strategy:

```bash
# Main branch: main (production-ready code)
main

# Feature branches: descriptive names
feature/add-student-attendance
feature/improve-grade-calculation
fix/bug-in-rapor-export
hotfix/critical-security-patch
```

### Commit Message Convention:

```bash
# ✅ DO: Clear & descriptive
git commit -m "Add student attendance feature"
git commit -m "Fix bug in rapor calculation"
git commit -m "Update nilai input form validation"
git commit -m "Refactor santri actions for better performance"

# Prefixes (optional but recommended):
feat: Add new feature
fix: Bug fix
refactor: Code refactoring
style: Formatting, styling
docs: Documentation
test: Testing
chore: Maintenance

# Examples:
git commit -m "feat: Add bulk import for santri"
git commit -m "fix: Correct grade average calculation"
git commit -m "docs: Update API documentation"

# ❌ DON'T: Vague messages
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
git commit -m "asdfgh"
```

### Workflow:

```bash
# Daily workflow:

# 1. Start of day: Pull latest
git pull origin main

# 2. Create feature branch (optional for small changes)
git checkout -b feature/new-feature

# 3. Make changes & commit regularly
git add .
git commit -m "Implement student attendance tracking"

# 4. Push to remote
git push origin feature/new-feature

# 5. Merge to main (if no conflicts)
git checkout main
git merge feature/new-feature
git push origin main

# 6. Delete feature branch (optional)
git branch -d feature/new-feature
```

### Git Rules:

✅ **DO:**
- Commit at least once per day
- Write clear commit messages
- Pull before starting work
- Push before end of day
- Create backup before major changes (`.\backup-all.ps1`)

❌ **DON'T:**
- Don't commit sensitive data (.env, database)
- Don't commit node_modules
- Don't force push to main
- Don't commit broken code
- Don't commit without testing

---

## 🔒 Security Rules

### Environment Variables:

```bash
# ✅ .env (NEVER commit this!)
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="your-encryption-key-32-chars"
```

```typescript
// ✅ Accessing env vars
const dbUrl = process.env.DATABASE_URL
const apiKey = process.env.API_KEY

// ❌ Never hardcode secrets
const apiKey = "sk_live_abc123..." // NO!
```

---

### Password Handling:

```typescript
// ✅ DO:
import bcrypt from "bcryptjs"

// Hash before saving
const hashedPassword = await bcrypt.hash(password, 10)
await prisma.user.create({
  data: { password: hashedPassword }
})

// Compare on login
const isValid = await bcrypt.compare(inputPassword, user.password)

// ❌ DON'T:
// - Never store plain passwords
// - Never return passwords in API responses
// - Never log passwords
```

---

### Authentication:

```typescript
// ✅ Protect routes with middleware
// File: middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*"]
}

// ✅ Check permissions in server actions
export async function deleteEntity(id: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized" }
  }
  
  if (!hasPermission(session.user.roles, "DELETE_ENTITY")) {
    return { success: false, error: "Forbidden" }
  }
  
  // Proceed with deletion
}
```

---

### Input Validation:

```typescript
// ✅ DO: Validate all inputs
import { z } from "zod"

const santriSchema = z.object({
  fullName: z.string().min(1, "Name required").max(100),
  email: z.string().email("Invalid email"),
  age: z.number().min(10).max(30),
  phone: z.string().regex(/^08\d{8,11}$/, "Invalid phone")
})

// Use in server actions
export async function createSantri(data: unknown) {
  const validated = santriSchema.parse(data) // Throws if invalid
  // Use validated data
}

// ❌ DON'T: Trust client input
const name = formData.get("name") // Could be anything!
await prisma.user.create({ data: { name } }) // SQL injection risk if not validated
```

---

### File Upload Security:

```typescript
// ✅ DO:
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function uploadImage(file: File) {
  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File too large" }
  }
  
  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Invalid file type" }
  }
  
  // Sanitize filename
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  
  // Save file
  // ...
}
```

---

## 🚀 VPS Deployment & Production Environment

### Production Infrastructure:

**Domain:** siakad.tsn.ponpes.id  
**Repository:** [Irfan-Mahdi-acc/siakad-tsn-ponpes](https://github.com/Irfan-Mahdi-acc/siakad-tsn-ponpes)  
**Deployment:** GitHub Actions (Auto-deploy on push to `main`)

---

### Directory Structure (VPS):

```bash
/var/www/siakad-tsn/
├── .next/
│   └── standalone/          # Production build
│       ├── server.js        # PM2 entry point
│       ├── .next/
│       │   └── static/      # Static assets
│       └── public/
│           └── uploads/     # User uploaded files
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env                     # Production environment variables
├── package.json
└── ecosystem.config.js      # PM2 configuration
```

---

### Environment Variables (Production):

```bash
# ✅ Production .env file location: /var/www/siakad-tsn/.env

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/siakad_tsn?schema=public"

# NextAuth
NEXTAUTH_URL="https://siakad.tsn.ponpes.id"
NEXTAUTH_SECRET="your-strong-secret-min-32-chars"

# Google OAuth (Production)
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"

# Encryption
ENCRYPTION_KEY="your-32-char-encryption-key"

# Node Environment
NODE_ENV="production"
```

> [!IMPORTANT]
> **Generate Strong Secrets:**
> ```bash
> # Generate NEXTAUTH_SECRET
> openssl rand -base64 32
> 
> # Generate ENCRYPTION_KEY (32 characters)
> openssl rand -hex 16
> ```

---

### Deployment Workflow:

#### ✅ Automated Deployment (Recommended):

```bash
# 1. Push to GitHub main branch
git add .
git commit -m "feat: your feature description"
git push origin main

# 2. GitHub Actions automatically:
#    - Pulls latest code to VPS
#    - Installs dependencies
#    - Runs database migrations
#    - Builds application
#    - Restarts PM2
#    - Performs health check
#    - Sends Telegram notification
```

#### 🔧 Manual Deployment:

```bash
# SSH to VPS
ssh deploy@your-vps-ip -p 2222

# Navigate to app directory
cd /var/www/siakad-tsn

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run database migrations (PRODUCTION ONLY!)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Copy static files for standalone mode
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Restart PM2
pm2 restart siakad-tsn

# Check status
pm2 status
pm2 logs siakad-tsn --lines 50
```

> [!CAUTION]
> **NEVER use `npx prisma migrate dev` in production!**
> 
> Always use `npx prisma migrate deploy` for production deployments.

---

### PM2 Process Management:

#### Configuration:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'siakad-tsn',
    cwd: '/var/www/siakad-tsn',
    script: 'node',
    args: '.next/standalone/server.js',
    instances: 2,              // Cluster mode
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/logs/siakad-error.log',
    out_file: '/var/www/logs/siakad-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
```

#### Common PM2 Commands:

```bash
# Check application status
pm2 status

# View logs (real-time)
pm2 logs siakad-tsn

# View last 100 lines
pm2 logs siakad-tsn --lines 100

# Restart application
pm2 restart siakad-tsn

# Stop application
pm2 stop siakad-tsn

# Start application
pm2 start ecosystem.config.js

# Reload (zero-downtime restart)
pm2 reload siakad-tsn

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save

# View detailed info
pm2 show siakad-tsn
```

---

### Database Management (Production):

#### PostgreSQL Connection:

```bash
# Connect to PostgreSQL
psql -U postgres -d siakad_tsn

# Common PostgreSQL commands:
\dt              # List tables
\d table_name    # Describe table
\q               # Quit
```

#### Migration Workflow:

```bash
# ✅ DO (Production):
npx prisma migrate deploy    # Apply pending migrations
npx prisma generate          # Regenerate Prisma client

# ❌ DON'T (Production):
npx prisma migrate dev       # NEVER use in production!
npx prisma migrate reset     # Will delete all data!
npx prisma db push           # Bypasses migration system
```

#### Database Backup:

```bash
# Manual backup
pg_dump -U postgres siakad_tsn > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U postgres -d siakad_tsn < backup_file.sql

# Automated daily backups (cron)
# Add to crontab: crontab -e
0 2 * * * pg_dump -U postgres siakad_tsn > /var/backups/db/siakad_$(date +\%Y\%m\%d).sql
```

---

### Nginx Configuration:

#### Reverse Proxy Setup:

```nginx
# /etc/nginx/sites-available/siakad-tsn

upstream siakad_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name siakad.tsn.ponpes.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name siakad.tsn.ponpes.id;
    
    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/siakad.tsn.ponpes.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/siakad.tsn.ponpes.id/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Upload directory protection
    location ~* ^/uploads/.*\.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi|exe)$ {
        deny all;
        return 403;
    }
    
    # Serve uploads
    location /uploads/ {
        alias /var/www/siakad-tsn/.next/standalone/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Next.js
    location / {
        proxy_pass http://siakad_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Nginx Commands:

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

---

### SSL Certificate Management:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d siakad.tsn.ponpes.id

# Auto-renewal is configured by default
# Test renewal
sudo certbot renew --dry-run

# Check certificate expiry
sudo certbot certificates
```

---

### Production Security Checklist:

- [x] SSH key-only authentication (port 2222)
- [x] UFW firewall enabled (ports 80, 443, 2222)
- [x] Fail2Ban configured
- [x] PostgreSQL local-only access
- [x] Strong passwords and secrets
- [x] File upload validation (magic bytes)
- [x] Nginx upload directory protection
- [x] SSL/TLS enabled (HTTPS only)
- [x] Security headers configured
- [x] Regular automated backups
- [x] PM2 log rotation enabled

---

### Monitoring & Health Checks:

```bash
# Check application health
curl https://siakad.tsn.ponpes.id

# Check PM2 status
pm2 status

# Check disk space
df -h

# Check memory usage
free -h

# Check database connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check Nginx status
sudo systemctl status nginx

# Check firewall status
sudo ufw status verbose

# Check fail2ban status
sudo fail2ban-client status sshd
```

---

### Troubleshooting:

#### Application Not Starting:

```bash
# Check PM2 logs
pm2 logs siakad-tsn --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart siakad-tsn

# Check environment variables
cat /var/www/siakad-tsn/.env
```

#### Database Connection Issues:

```bash
# Test PostgreSQL connection
psql -U postgres -d siakad_tsn

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database URL in .env
grep DATABASE_URL /var/www/siakad-tsn/.env
```

#### Nginx Issues:

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### Upload Issues:

```bash
# Check upload directory permissions
ls -la /var/www/siakad-tsn/.next/standalone/public/uploads/

# Fix permissions if needed
sudo chown -R deploy:deploy /var/www/siakad-tsn/.next/standalone/public/uploads/
sudo chmod -R 755 /var/www/siakad-tsn/.next/standalone/public/uploads/
```

---

## ⚡ Performance Guidelines

### Component Optimization:

```typescript
// ✅ DO: Use React.memo for expensive components
import { memo } from "react"

export const ExpensiveTable = memo(function ExpensiveTable({ data }) {
  // Heavy rendering logic
  return <div>{/* ... */}</div>
})

// ✅ DO: Use dynamic imports for heavy components
import dynamic from "next/dynamic"

const HeavyChart = dynamic(() => import("./heavy-chart"), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Don't render on server
})
```

---

### Database Optimization:

```typescript
// ✅ DO: Add indexes to frequently queried fields
model Santri {
  id       String  @id
  email    String  @unique // Automatic index
  kelasId  String  
  
  @@index([kelasId]) // Manual index for foreign keys
  @@index([createdAt]) // Index for sorting
}

// ✅ DO: Use select instead of fetching all fields
const santri = await prisma.santri.findMany({
  select: { id: true, fullName: true } // Only these fields
})

// ✅ DO: Use pagination
const santri = await prisma.santri.findMany({
  skip: 0,
  take: 20
})

// ❌ DON'T: N+1 queries
// BAD:
const kelasList = await prisma.kelas.findMany()
for (const kelas of kelasList) {
  const santri = await prisma.santri.findMany({ where: { kelasId: kelas.id } })
}

// GOOD:
const kelasList = await prisma.kelas.findMany({
  include: { santriList: true }
})
```

---

### Image Optimization:

```typescript
// ✅ DO: Use Next.js Image component
import Image from "next/image"

<Image 
  src="/uploads/photo.jpg"
  alt="Santri photo"
  width={200}
  height={200}
  quality={75}
/>

// ❌ DON'T: Use regular img tag
<img src="/uploads/photo.jpg" /> // No optimization
```

---

## 📚 Documentation Requirements

### Code Comments:

```typescript
// ✅ DO: Comment complex logic
// Calculate weighted average based on grade settings
// Formula: (score * weight) / total weight
const average = scores.reduce((sum, s) => sum + (s.score * s.weight), 0) / totalWeight

// ✅ DO: Document function purposes
/**
 * Calculates final grade for a santri in a specific subject
 * Takes into account midterm, final exam, and assignment scores
 * 
 * @param santriId - ID of the santri
 * @param mapelId - ID of the subject
 * @param semester - Semester number (1 or 2)
 * @returns Final grade with letter grade and category
 */
export async function calculateFinalGrade(
  santriId: string,
  mapelId: string,
  semester: number
) {
  // Implementation
}

// ❌ DON'T: Over-comment obvious code
const name = user.name // Get user name - OBVIOUS!
```

---

### README Files:

Create README.md for complex features:

```markdown
# Feature Name

## Overview
Brief description of the feature

## Usage
How to use this feature

## Components
- ComponentA: Purpose
- ComponentB: Purpose

## API
- `getEntityList()`: Fetch all entities
- `createEntity(data)`: Create new entity

## Examples
```typescript
// Example code
```

## Notes
Important notes or gotchas
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist:

Before committing major changes:

✅ **Functionality:**
- [ ] Feature works as expected
- [ ] All CRUD operations function correctly
- [ ] Form validation works
- [ ] Error handling works

✅ **UI/UX:**
- [ ] Responsive on mobile/tablet
- [ ] No console errors
- [ ] Loading states display correctly
- [ ] Success/error messages show

✅ **Data:**
- [ ] Data persists correctly
- [ ] Relations are maintained
- [ ] No data corruption

✅ **Security:**
- [ ] Authentication required
- [ ] Permissions checked
- [ ] No sensitive data exposed

---

### Testing After Database Changes:

```bash
# 1. Apply migration
npx prisma migrate dev --name description

# 2. Reset database (development only!)
npx prisma migrate reset

# 3. Seed test data
npx prisma db seed

# 4. Test application
npm run dev

# 5. Test all affected features
```

---

## 🎯 Summary & Quick Reference

### File Naming:
- Components: `PascalCase.tsx`
- Actions: `kebab-case-actions.ts`
- Utilities: `kebab-case.ts`
- Pages: `kebab-case/page.tsx`

### Code Structure:
- Server Components: Default (no "use client")
- Client Components: Add "use client" at top
- Server Actions: Add "use server" at top

### Database:
- Models: `PascalCase` singular
- Fields: `camelCase`
- Always include: `createdAt`, `updatedAt`

### Git:
- Commit often with clear messages
- Pull before starting work
- Push at end of day
- Backup before major changes

### Security:
- Never commit `.env`
- Hash passwords with bcrypt
- Validate all inputs with Zod
- Check authentication & permissions

---

## 📞 Need Help?

### Documentation:
- 📄 `GIT-WORKFLOW.md` - Git usage guide
- 📄 `BACKUP-STRATEGY.md` - Backup procedures
- 📄 `PROTECT-YOUR-PROGRESS.md` - Full protection guide
- 📄 `src/lib/*.md` - Feature-specific docs

### VPS & Deployment Documentation:
- 📄 `DEPLOYMENT.md` - Complete deployment guide
- 📄 `SECURITY-HARDENING.md` - Security best practices
- 📄 `DOMAIN-MIGRATION-QUICKSTART.md` - Domain setup guide
- 📄 `.agent/workflows/vps-maintenance.md` - VPS maintenance workflow
- 📄 `Auto_Deploy_Guide/` - GitHub Actions auto-deployment
- 📄 `nginx-config.conf` - Nginx configuration reference
- 📄 `env.production.template` - Production environment template

### External Resources:
- Next.js: https://nextjs.org/docs
- Prisma: https://prisma.io/docs
- Shadcn/ui: https://ui.shadcn.com
- Tailwind: https://tailwindcss.com/docs

---

**Last Updated:** December 20, 2025  
**Maintained By:** Admin Pondok Tadzimussunnah  
**Version:** 2.0.0 - VPS Production Ready

**These rules ensure consistency, maintainability, and quality across the entire codebase. Follow them diligently! 🚀**


