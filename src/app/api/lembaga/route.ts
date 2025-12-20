import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, apiResponse } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  // Validate API Key
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
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { jenjang: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    // Get total count
    const total = await prisma.lembaga.count({ where })

    // Get paginated data
    const lembagaList = await prisma.lembaga.findMany({
      where,
      skip,
      take: limit,
      include: {
        mudir: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            santris: true,
            kelas: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      apiResponse(true, lembagaList, undefined, {
        total,
        page,
        limit,
        totalPages
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/lembaga error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch lembaga data'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Validate API Key
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name, address, phone, email, logoUrl, jenjang, mudirId } = body

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        apiResponse(false, null, 'Name is required'),
        { status: 400 }
      )
    }

    // Create lembaga
    const lembaga = await prisma.lembaga.create({
      data: {
        name: name.trim(),
        address: address || null,
        phone: phone || null,
        email: email || null,
        logoUrl: logoUrl || null,
        jenjang: jenjang || null,
        mudirId: mudirId || null
      },
      include: {
        mudir: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      apiResponse(true, lembaga),
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/lembaga error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to create lembaga'),
      { status: 500 }
    )
  }
}
