import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, apiResponse } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const lembagaId = searchParams.get('lembagaId') || ''
    const level = searchParams.get('level') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (lembagaId) where.lembagaId = lembagaId
    if (level) where.level = level

    const total = await prisma.kelas.count({ where })

    const kelasList = await prisma.kelas.findMany({
      where,
      skip,
      take: limit,
      include: {
        lembaga: {
          select: {
            id: true,
            name: true,
            jenjang: true
          }
        },
        waliKelas: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        ketuaKelas: {
          select: {
            id: true,
            nama: true,
            nis: true
          }
        },
        _count: {
          select: {
            santris: true,
            mapels: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      apiResponse(true, kelasList, undefined, {
        total,
        page,
        limit,
        totalPages
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/kelas error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch kelas data'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name, level, lembagaId, waliKelasId, ketuaKelasId, nextKelasId } = body

    // Validation
    if (!name || !level || !lembagaId) {
      return NextResponse.json(
        apiResponse(false, null, 'Name, level, and lembagaId are required'),
        { status: 400 }
      )
    }

    const kelas = await prisma.kelas.create({
      data: {
        name,
        level,
        lembagaId,
        waliKelasId: waliKelasId || null,
        ketuaKelasId: ketuaKelasId || null,
        nextKelasId: nextKelasId || null
      },
      include: {
        lembaga: {
          select: {
            name: true,
            jenjang: true
          }
        },
        waliKelas: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      apiResponse(true, kelas),
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/kelas error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to create kelas'),
      { status: 500 }
    )
  }
}
