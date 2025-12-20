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

    const mapel = await prisma.mapel.findUnique({
      where: { id },
      include: {
        kelas: {
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
            },
            _count: {
              select: {
                santris: true
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
        group: true,
        jadwals: {
          include: {
            jamPelajaran: true
          },
          orderBy: [
            { day: 'asc' },
            { jamPelajaran: { order: 'asc' } }
          ]
        },
        ujians: {
          select: {
            id: true,
            name: true,
            type: true,
            date: true,
            semester: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    })

    if (!mapel) {
      return NextResponse.json(
        apiResponse(false, null, 'Mapel not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      apiResponse(true, mapel),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/mapel/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch mapel'),
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

    const existing = await prisma.mapel.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Mapel not found'),
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.code !== undefined) updateData.code = body.code
    if (body.ustadzId !== undefined) updateData.ustadzId = body.ustadzId
    if (body.groupId !== undefined) updateData.groupId = body.groupId

    const mapel = await prisma.mapel.update({
      where: { id },
      data: updateData,
      include: {
        kelas: {
          select: {
            name: true,
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
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/mapel/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to update mapel'),
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

    const existing = await prisma.mapel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ujians: true,
            nilais: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Mapel not found'),
        { status: 404 }
      )
    }

    if (existing._count.ujians > 0 || existing._count.nilais > 0) {
      return NextResponse.json(
        apiResponse(
          false,
          null,
          `Cannot delete mapel with ${existing._count.ujians} ujians and ${existing._count.nilais} nilais`
        ),
        { status: 400 }
      )
    }

    await prisma.mapel.delete({ where: { id } })

    return NextResponse.json(
      apiResponse(true, { message: 'Mapel deleted successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/mapel/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to delete mapel'),
      { status: 500 }
    )
  }
}
