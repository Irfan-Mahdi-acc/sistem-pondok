import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get sync metadata for all data types
    const syncMeta = await prisma.syncMetadata.findMany({
      where: {
        dataType: {
          in: ['santri', 'kelas', 'ustadz', 'jadwal']
        }
      }
    })

    // Format response
    const updates: any = {}
    
    for (const meta of syncMeta) {
      updates[meta.dataType] = {
        hasUpdate: true, // Client will compare timestamps
        lastModified: meta.lastModified.toISOString(),
        recordCount: meta.recordCount
      }
    }

    // Fill in missing types with defaults
    const dataTypes = ['santri', 'kelas', 'ustadz', 'jadwal']
    for (const type of dataTypes) {
      if (!updates[type]) {
        updates[type] = {
          hasUpdate: false,
          lastModified: new Date().toISOString(),
          recordCount: 0
        }
      }
    }

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Check updates API error:', error)
    return NextResponse.json(
      { error: 'Failed to check updates' },
      { status: 500 }
    )
  }
}
