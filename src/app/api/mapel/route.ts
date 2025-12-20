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
    const kelasId = searchParams.get('kelasId') || ''
    const ustadzId = searchParams.get('ustadzId') || ''
    const groupId = searchParams.get('groupId') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (kelasId) where.kelasId = kelasId
    if (ustadzId) where.ustadzId = ustadzId
    if (groupId) where.groupId = groupId

    const total = await prisma.mapel.count({ where })

    const mapelList = await prisma.mapel.findMany({
      where,
      skip,
      take: limit,
      include: {
        kelas: {
          select: {
            id: true,
            name: true,
            level: true,
            lembaga: {
              select: {
                id: true,
                name: true,
                jenjang: true
              }
            }
          }
        },
        ustadz: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            order: true
          }
        },
        _count: {
          select: {
            jadwals: true,
            ujians: true,
            nilais: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      apiResponse(true, mapelList, undefined, {
        total,
        page,
        limit,
        totalPages
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/mapel error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch mapel data'),
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
    const { name, code, kelasId, ustadzId, groupId } = body

    // Validation
    if (!name || !kelasId) {
      return NextResponse.json(
        apiResponse(false, null, 'Name and kelasId are required'),
        { status: 400 }
      )
    }

    const mapel = await prisma.mapel.create({
      data: {
        name,
        code: code || null,
        kelasId,
        ustadzId: ustadzId || null,
        groupId: groupId || null
      },
      include: {
        kelas: {
          select: {
            name: true,
            level: true,
            lembaga: {
              select: {
                name: true
              }
            }
          }
        },
        ustadz: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        group: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(
      apiResponse(true, mapel),
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/mapel error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to create mapel'),
      { status: 500 }
    )
  }
}
