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

    const santri = await prisma.santri.findUnique({
      where: { id },
      include: {
        lembaga: true,
        kelas: {
          include: {
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
        },
        asrama: true,
        halqoh: {
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
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    if (!santri) {
      return NextResponse.json(
        apiResponse(false, null, 'Santri not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      apiResponse(true, santri),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/santri/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch santri'),
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

    const existing = await prisma.santri.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Santri not found'),
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.nama !== undefined) updateData.nama = body.nama
    if (body.nisn !== undefined) updateData.nisn = body.nisn
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.birthPlace !== undefined) updateData.birthPlace = body.birthPlace
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate ? new Date(body.birthDate) : null
    if (body.address !== undefined) updateData.address = body.address
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.email !== undefined) updateData.email = body.email
    if (body.kelasId !== undefined) updateData.kelasId = body.kelasId
    if (body.asramaId !== undefined) updateData.asramaId = body.asramaId
    if (body.halqohId !== undefined) updateData.halqohId = body.halqohId
    if (body.status !== undefined) updateData.status = body.status
    if (body.fatherName !== undefined) updateData.fatherName = body.fatherName
    if (body.motherName !== undefined) updateData.motherName = body.motherName
    if (body.waliName !== undefined) updateData.waliName = body.waliName

    const santri = await prisma.santri.update({
      where: { id },
      data: updateData,
      include: {
        lembaga: {
          select: {
            name: true
          }
        },
        kelas: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(
      apiResponse(true, santri),
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/santri/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to update santri'),
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

    const existing = await prisma.santri.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Santri not found'),
        { status: 404 }
      )
    }

    await prisma.santri.delete({ where: { id } })

    return NextResponse.json(
      apiResponse(true, { message: 'Santri deleted successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/santri/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to delete santri'),
      { status: 500 }
    )
  }
}
