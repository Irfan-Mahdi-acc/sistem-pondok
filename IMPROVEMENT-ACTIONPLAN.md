# 🎯 Action Plan: Improvement Roadmap
## Sistem Web Pondok Tadzimussunnah

> **Based on:** Comprehensive Evaluation (87/100)  
> **Goal:** Reach 95/100 & Production-Ready  
> **Timeline:** 3-4 weeks

---

## 📊 Current Score: **87/100** → Target: **95/100**

---

## 🚨 WEEK 1: Critical Performance & Security

### Priority 1: Add Pagination (CRITICAL) ⚡
**Impact:** High | **Effort:** Medium | **Time:** 2-3 days

**Problem:**
```typescript
// ❌ Current: Fetch ALL records
export async function getSantriList() {
  return await prisma.santri.findMany() // Could be thousands!
}
```

**Solution:**
```typescript
// ✅ Add pagination
export async function getSantriList(
  page: number = 1, 
  limit: number = 20,
  search?: string
) {
  const where = search ? {
    fullName: { contains: search }
  } : {}
  
  const [data, total] = await Promise.all([
    prisma.santri.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.santri.count({ where })
  ])
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}
```

**Files to Update:**
```
✅ src/actions/santri-actions.ts
✅ src/actions/ustadz-actions.ts
✅ src/actions/kelas-actions.ts
✅ src/actions/nilai-actions.ts
✅ (All list endpoints - ~15 files)
```

**Component Updates:**
```typescript
// Add pagination UI
<div className="mt-4">
  <Pagination 
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
</div>
```

---

### Priority 2: Add Database Indexes ⚡
**Impact:** High | **Effort:** Low | **Time:** 1 hour

**Files:** `prisma/schema.prisma`

```prisma
model Santri {
  // ... fields ...
  
  @@index([kelasId])
  @@index([lembagaId])
  @@index([fullName])
  @@index([createdAt])
}

model Nilai {
  @@index([santriId])
  @@index([mapelId])
  @@index([kelasId])
  @@index([semester])
}

model Kelas {
  @@index([lembagaId])
  @@index([name])
}

// Add to all models with foreign keys
```

**Migration:**
```bash
npx prisma migrate dev --name add_performance_indexes
```

---

### Priority 3: Authorization Consistency 🔒
**Impact:** High | **Effort:** Medium | **Time:** 2 days

**Create Auth Utility:**
```typescript
// src/lib/auth-utils.ts
import { auth } from "@/auth"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requirePermission(
  permission: string,
  resource: string
) {
  const session = await requireAuth()
  if (!hasPermission(session.user, permission, resource)) {
    throw new Error("Forbidden")
  }
  return session
}

export function hasPermission(
  user: any,
  permission: string,
  resource: string
): boolean {
  // Check user roles & permissions
  const roles = JSON.parse(user.roles || '[]')
  // Implement permission logic
  return true // placeholder
}
```

**Update Actions:**
```typescript
// Before:
export async function deleteSantri(id: string) {
  await prisma.santri.delete({ where: { id } })
}

// After:
export async function deleteSantri(id: string) {
  const session = await requirePermission('delete', 'santri')
  await prisma.santri.delete({ where: { id } })
}
```

**Files to Update:** All mutation actions (~30 files)

---

### Priority 4: Input Validation 🔒
**Impact:** High | **Effort:** Medium | **Time:** 2 days

**Create Validation Schemas:**
```typescript
// src/lib/schemas.ts
import { z } from "zod"

export const santriSchema = z.object({
  fullName: z.string().min(3).max(100),
  birthDate: z.date(),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  kelasId: z.string().cuid(),
  nisn: z.string().length(10).optional(),
  phone: z.string().regex(/^08\d{8,11}$/).optional()
})

export const nilaiSchema = z.object({
  santriId: z.string().cuid(),
  mapelId: z.string().cuid(),
  nilai: z.number().min(0).max(100),
  semester: z.number().int().min(1).max(2)
})

// Create for all major entities
```

**Update Actions:**
```typescript
// Before:
export async function createSantri(formData: FormData) {
  const name = formData.get('name') as string // ❌ No validation
  // ...
}

// After:
export async function createSantri(formData: FormData) {
  const data = santriSchema.parse({
    fullName: formData.get('name'),
    birthDate: new Date(formData.get('birthDate') as string),
    // ... other fields
  }) // ✅ Validated
  // ...
}
```

---

## 📅 WEEK 2: Testing & Caching

### Priority 5: Setup Testing Infrastructure 🧪
**Impact:** High | **Effort:** High | **Time:** 3 days

**Install Dependencies:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D @vitejs/plugin-react
```

**Config:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**First Tests:**
```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { calculateAverage } from '../grade-calculations'

describe('Grade Calculations', () => {
  it('should calculate average correctly', () => {
    const grades = [80, 90, 85]
    expect(calculateAverage(grades)).toBe(85)
  })
})
```

```typescript
// src/actions/__tests__/santri-actions.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getSantriList } from '../santri-actions'

describe('Santri Actions', () => {
  it('should return paginated santri list', async () => {
    const result = await getSantriList(1, 10)
    expect(result.data).toBeInstanceOf(Array)
    expect(result.pagination).toBeDefined()
  })
})
```

**Target:** 50% code coverage minimum

---

### Priority 6: Implement Caching ⚡
**Impact:** High | **Effort:** Medium | **Time:** 2 days

**Use React cache():**
```typescript
// src/lib/cache.ts
import { cache } from 'react'
import { prisma } from './prisma'

// Cache expensive queries
export const getCachedSantriList = cache(async () => {
  return await prisma.santri.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  })
})

export const getCachedLembagaList = cache(async () => {
  return await prisma.lembaga.findMany()
})

// Use unstable_cache for data that changes rarely
import { unstable_cache } from 'next/cache'

export const getAppSettings = unstable_cache(
  async () => await prisma.appSettings.findFirst(),
  ['app-settings'],
  { revalidate: 3600 } // 1 hour
)
```

**Update Pages:**
```typescript
// Before:
const santriList = await getSantriList()

// After:
const santriList = await getCachedSantriList()
```

---

### Priority 7: Query Optimization ⚡
**Impact:** Medium | **Effort:** Medium | **Time:** 2 days

**Fix N+1 Queries:**
```typescript
// ❌ Before: N+1 problem
const kelases = await prisma.kelas.findMany()
for (const kelas of kelases) {
  kelas.santriCount = await prisma.santri.count({
    where: { kelasId: kelas.id }
  })
}

// ✅ After: Single query
const kelases = await prisma.kelas.findMany({
  include: {
    _count: {
      select: { santriList: true }
    }
  }
})
```

**Optimize Selects:**
```typescript
// ❌ Fetching everything
const santri = await prisma.santri.findMany({
  include: { kelas: true, nilai: true, /* ... */ }
})

// ✅ Select only needed fields
const santri = await prisma.santri.findMany({
  select: {
    id: true,
    fullName: true,
    kelas: {
      select: { name: true }
    }
  }
})
```

---

## 📅 WEEK 3: UI & UX Improvements

### Priority 8: Search & Filter 🎨
**Impact:** Medium | **Effort:** Medium | **Time:** 3 days

**Create Search Component:**
```typescript
// src/components/ui/search-input.tsx
"use client"

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from './input'
import { useDebouncedCallback } from 'use-debounce'

export function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearch(value)
  }, 300)
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          debouncedSearch(e.target.value)
        }}
        className="pl-10"
      />
    </div>
  )
}
```

**Add to Tables:**
```typescript
<SearchInput onSearch={(q) => setSearchQuery(q)} />
<Table data={filteredData} />
```

---

### Priority 9: Bulk Operations 🎨
**Impact:** Medium | **Effort:** Medium | **Time:** 2 days

**Add Selection:**
```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([])

<Checkbox
  checked={selectedIds.length === data.length}
  onCheckedChange={(checked) => {
    if (checked) {
      setSelectedIds(data.map(item => item.id))
    } else {
      setSelectedIds([])
    }
  }}
/>

// Bulk actions
<Button 
  onClick={() => bulkDelete(selectedIds)}
  disabled={selectedIds.length === 0}
>
  Delete Selected
</Button>
```

---

### Priority 10: Better Error Handling 🐛
**Impact:** Medium | **Effort:** Medium | **Time:** 2 days

**Error Boundary:**
```typescript
// src/components/error-boundary.tsx
"use client"

import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error) {
    console.error('Error caught:', error)
    // Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong!</div>
    }
    return this.props.children
  }
}
```

**Standardized Error Format:**
```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED', 'Unauthorized', 401)
  }
}
```

---

## 📅 WEEK 4: Production Hardening

### Priority 11: Database Migration Planning 🗄️
**Impact:** High | **Effort:** High | **Time:** 3 days

**PostgreSQL Setup:**
```bash
# Install PostgreSQL
# Update DATABASE_URL in .env

# New schema connection
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}

# Generate migration
npx prisma migrate dev --name migrate_to_postgresql

# Deploy
npx prisma migrate deploy
```

**Data Migration Script:**
```typescript
// scripts/migrate-data.ts
import { PrismaClient as SqlitePrisma } from '@prisma/client/sqlite'
import { PrismaClient as PostgresPrisma } from '@prisma/client/postgres'

async function migrateData() {
  const sqlite = new SqlitePrisma()
  const postgres = new PostgresPrisma()
  
  // Migrate users
  const users = await sqlite.user.findMany()
  await postgres.user.createMany({ data: users })
  
  // Migrate other tables...
  
  console.log('Migration complete!')
}
```

---

### Priority 12: Monitoring & Logging 📊
**Impact:** Medium | **Effort:** Medium | **Time:** 2 days

**Setup Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

**Add Logging:**
```typescript
// src/lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

// Usage in actions:
logger.info('User login', { userId, timestamp })
logger.error('Database error', { error, context })
```

---

### Priority 13: Deployment Preparation 🚀
**Impact:** High | **Effort:** Medium | **Time:** 2 days

**Environment Setup:**
```bash
# .env.production
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="production-secret-min-32-chars"
NEXTAUTH_URL="https://your-domain.com"
SENTRY_DSN="..."
```

**Build & Test:**
```bash
npm run build
npm run start

# Test production build
```

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Docker (Alternative):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ✅ Completion Checklist

### Week 1: Performance & Security ✅
- [ ] Pagination implemented (15 files)
- [ ] Database indexes added
- [ ] Authorization consistent (30 files)
- [ ] Input validation (Zod schemas)
- [ ] Test locally

### Week 2: Testing & Caching ✅
- [ ] Testing setup (Vitest)
- [ ] Write initial tests (50% coverage)
- [ ] Caching implemented
- [ ] N+1 queries fixed
- [ ] Query optimization done

### Week 3: UI/UX ✅
- [ ] Search & filter added
- [ ] Bulk operations implemented
- [ ] Error handling improved
- [ ] Empty states added
- [ ] Loading skeletons

### Week 4: Production ✅
- [ ] PostgreSQL migration
- [ ] Monitoring setup (Sentry)
- [ ] Logging implemented
- [ ] Environment configs
- [ ] Production deployment
- [ ] Load testing
- [ ] Backup automation

---

## 📊 Expected Results

### Performance Metrics:
```
Before:
- Page load: 2-3s (with 1000+ records)
- Database queries: 50-100ms
- No pagination

After:
- Page load: 500-800ms
- Database queries: 10-30ms
- Pagination: 20 items/page
- Caching: 90% hit rate
```

### Quality Metrics:
```
Before:
- Test coverage: 0%
- Security score: 82/100
- Performance score: 80/100

After:
- Test coverage: 50%+
- Security score: 90/100
- Performance score: 92/100
```

### Score Improvement:
```
Current: 87/100
Target:  95/100
Improvement: +8 points
```

---

## 💰 Estimated Effort

| Week | Tasks | Hours | Difficulty |
|------|-------|-------|------------|
| Week 1 | Performance & Security | 40h | Medium |
| Week 2 | Testing & Caching | 40h | High |
| Week 3 | UI/UX | 30h | Medium |
| Week 4 | Production | 30h | High |
| **Total** | **All Priorities** | **140h** | - |

**Full-time equivalent:** ~3.5 weeks  
**Part-time (50%):** ~7 weeks

---

## 🎯 Success Criteria

### Must Have (Production Ready):
1. ✅ Pagination on all lists
2. ✅ Database indexes
3. ✅ Authorization checks
4. ✅ Input validation
5. ✅ Basic tests (critical paths)
6. ✅ Error handling
7. ✅ PostgreSQL migration
8. ✅ Deployment successful

### Nice to Have (Excellence):
1. ⭐ 70%+ test coverage
2. ⭐ Full caching strategy
3. ⭐ Monitoring dashboard
4. ⭐ Advanced UI features
5. ⭐ Documentation updates

---

## 📞 Support & Resources

### Documentation:
- Next.js: https://nextjs.org/docs
- Prisma: https://prisma.io/docs
- Vitest: https://vitest.dev
- Sentry: https://docs.sentry.io

### Community:
- Next.js Discord
- Prisma Slack
- Stack Overflow

---

**Start Date:** [Fill in]  
**Target Completion:** [Fill in +4 weeks]  
**Owner:** [Your name]

**Let's make this production-ready! 🚀**

