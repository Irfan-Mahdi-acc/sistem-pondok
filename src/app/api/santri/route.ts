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
    const lembagaId = searchParams.get('lembagaId') || ''
    const kelasId = searchParams.get('kelasId') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { nis: { contains: search, mode: 'insensitive' as const } },
        { nama: { contains: search, mode: 'insensitive' as const } },
        { nisn: { contains: search, mode: 'insensitive' as const } }
      ]
    }
    
    if (lembagaId) where.lembagaId = lembagaId
    if (kelasId) where.kelasId = kelasId
    if (status) where.status = status

    const total = await prisma.santri.count({ where })

    const santriList = await prisma.santri.findMany({
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
        kelas: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        asrama: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      apiResponse(true, santriList, undefined, {
        total,
        page,
        limit,
        totalPages
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/santri error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch santri data'),
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
      nis,
      nisn,
      nama,
      gender,
      birthPlace,
      birthDate,
      address,
      phone,
      email,
      lembagaId,
      kelasId,
      asramaId,
      status,
      fatherName,
      motherName,
      waliName
    } = body

    // Validation
    if (!nis || !nama || !gender || !lembagaId) {
      return NextResponse.json(
        apiResponse(false, null, 'NIS, nama, gender, and lembagaId are required'),
        { status: 400 }
      )
    }

    // Check if NIS already exists
    const existing = await prisma.santri.findUnique({
      where: { nis }
    })
    if (existing) {
      return NextResponse.json(
        apiResponse(false, null, 'NIS already exists'),
        { status: 400 }
      )
    }

    const santri = await prisma.santri.create({
      data: {
        nis,
        nisn: nisn || null,
        nama,
        gender,
        birthPlace: birthPlace || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        lembagaId,
        kelasId: kelasId || null,
        asramaId: asramaId || null,
        status: status || 'ACTIVE',
        fatherName: fatherName || null,
        motherName: motherName || null,
        waliName: waliName || null
      },
      include: {
        lembaga: {
          select: {
            name: true,
            jenjang: true
          }
        },
        kelas: {
          select: {
            name: true,
            level: true
          }
        }
      }
    })

    return NextResponse.json(
      apiResponse(true, santri),
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/santri error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to create santri'),
      { status: 500 }
    )
  }
}
