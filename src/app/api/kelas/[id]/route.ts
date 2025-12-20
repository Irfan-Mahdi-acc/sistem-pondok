import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, apiResponse } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const { id } = params

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        lembaga: true,
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
            nis: true,
            nama: true,
            phone: true
          }
        },
        santris: {
          select: {
            id: true,
            nis: true,
            nama: true,
            gender: true,
            status: true
          },
          orderBy: {
            nama: 'asc'
          }
        },
        mapels: {
          include: {
            ustadz: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        jadwals: {
          include: {
            mapel: {
              select: {
                name: true
              }
            },
            jamPelajaran: true
          },
          orderBy: [
            { day: 'asc' },
            { jamPelajaran: { order: 'asc' } }
          ]
        }
      }
    })

    if (!kelas) {
      return NextResponse.json(
        apiResponse(false, null, 'Kelas not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      apiResponse(true, kelas),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/kelas/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch kelas'),
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const { id } = params
    const body = await request.json()

    const existing = await prisma.kelas.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Kelas not found'),
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.level !== undefined) updateData.level = body.level
    if (body.waliKelasId !== undefined) updateData.waliKelasId = body.waliKelasId
    if (body.ketuaKelasId !== undefined) updateData.ketuaKelasId = body.ketuaKelasId
    if (body.nextKelasId !== undefined) updateData.nextKelasId = body.nextKelasId

    const kelas = await prisma.kelas.update({
      where: { id },
      data: updateData,
      include: {
        lembaga: {
          select: {
            name: true
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
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/kelas/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to update kelas'),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const { id } = params

    const existing = await prisma.kelas.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            santris: true,
            mapels: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Kelas not found'),
        { status: 404 }
      )
    }

    if (existing._count.santris > 0 || existing._count.mapels > 0) {
      return NextResponse.json(
        apiResponse(
          false,
          null,
          `Cannot delete kelas with ${existing._count.santris} santris and ${existing._count.mapels} mapels`
        ),
        { status: 400 }
      )
    }

    await prisma.kelas.delete({ where: { id } })

    return NextResponse.json(
      apiResponse(true, { message: 'Kelas deleted successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/kelas/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to delete kelas'),
      { status: 500 }
    )
  }
}
