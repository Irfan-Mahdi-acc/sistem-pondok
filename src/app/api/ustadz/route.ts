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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { nik: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } }
      ]
    }
    
    if (status) {
      where.status = status
    }

    const total = await prisma.ustadzProfile.count({ where })

    const ustadzList = await prisma.ustadzProfile.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            mapels: true,
            homeroomClasses: true,
            halqohs: true
          }
        }
      },
      orderBy: {
        hireDate: 'desc'
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      apiResponse(true, ustadzList, undefined, {
        total,
        page,
        limit,
        totalPages
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/ustadz error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch ustadz data'),
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
    const {
      userId,
      nik,
      phone,
      address,
      birthPlace,
      birthDate,
      hireDate,
      status,
      specialization,
      education
    } = body

    // Check if NIK already exists
    if (nik) {
      const existing = await prisma.ustadzProfile.findUnique({
        where: { nik }
      })
      if (existing) {
        return NextResponse.json(
          apiResponse(false, null, 'NIK already exists'),
          { status: 400 }
        )
      }
    }

    const ustadz = await prisma.ustadzProfile.create({
      data: {
        userId: userId || null,
        nik: nik || null,
        phone: phone || null,
        address: address || null,
        birthPlace: birthPlace || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        status: status || 'ACTIVE',
        specialization: specialization || null,
        education: education || null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(
      apiResponse(true, ustadz),
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/ustadz error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to create ustadz'),
      { status: 500 }
    )
  }
}
