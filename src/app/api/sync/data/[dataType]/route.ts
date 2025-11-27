import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ dataType: string }> }
) {
  try {
    const { dataType } = await context.params

    let data: any[] = []
    let recordCount = 0

    // Fetch data based on type
    switch (dataType) {
      case 'santri':
        data = await prisma.santri.findMany({
          include: {
            lembaga: true,
            kelas: true,
            asrama: true
          }
        })
        recordCount = data.length
        break

      case 'kelas':
        data = await prisma.kelas.findMany({
          include: {
            lembaga: true
          }
        })
        recordCount = data.length
        break

      case 'ustadz':
        // TODO: Add Ustadz model to schema
        // For now, return empty array
        data = []
        recordCount = 0
        break

      case 'jadwal':
        // TODO: Add Jadwal model to schema
        // For now, return empty array
        data = []
        recordCount = 0
        break

      default:
        return NextResponse.json(
          { error: 'Invalid data type' },
          { status: 400 }
        )
    }

    // Get sync metadata
    const syncMeta = await prisma.syncMetadata.findUnique({
      where: { dataType }
    })

    const lastModified = syncMeta?.lastModified.toISOString() || new Date().toISOString()

    return NextResponse.json({
      dataType,
      data,
      lastModified,
      recordCount
    })
  } catch (error) {
    console.error(`Fetch data error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
