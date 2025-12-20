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

    const ustadz = await prisma.ustadzProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
            role: true
          }
        },
        mapels: {
          include: {
            kelas: {
              select: {
                name: true,
                level: true
              }
            }
          }
        },
        homeroomClasses: {
          select: {
            id: true,
            name: true,
            level: true,
            _count: {
              select: {
                santris: true
              }
            }
          }
        },
        halqohs: {
          select: {
            id: true,
            name: true,
            level: true,
            _count: {
              select: {
                santris: true
              }
            }
          }
        }
      }
    })

    if (!ustadz) {
      return NextResponse.json(
        apiResponse(false, null, 'Ustadz not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      apiResponse(true, ustadz),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/ustadz/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch ustadz'),
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

    const existing = await prisma.ustadzProfile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Ustadz not found'),
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.nik !== undefined) updateData.nik = body.nik
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.address !== undefined) updateData.address = body.address
    if (body.birthPlace !== undefined) updateData.birthPlace = body.birthPlace
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate ? new Date(body.birthDate) : null
    if (body.hireDate !== undefined) updateData.hireDate = body.hireDate ? new Date(body.hireDate) : null
    if (body.status !== undefined) updateData.status = body.status
    if (body.specialization !== undefined) updateData.specialization = body.specialization
    if (body.education !== undefined) updateData.education = body.education

    const ustadz = await prisma.ustadzProfile.update({
      where: { id },
      data: updateData,
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
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/ustadz/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to update ustadz'),
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

    const existing = await prisma.ustadzProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mapels: true,
            homeroomClasses: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Ustadz not found'),
        { status: 404 }
      )
    }

    if (existing._count.mapels > 0 || existing._count.homeroomClasses > 0) {
      return NextResponse.json(
        apiResponse(
          false,
          null,
          `Cannot delete ustadz with ${existing._count.mapels} mapels and ${existing._count.homeroomClasses} homeroom classes`
        ),
        { status: 400 }
      )
    }

    await prisma.ustadzProfile.delete({ where: { id } })

    return NextResponse.json(
      apiResponse(true, { message: 'Ustadz deleted successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/ustadz/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to delete ustadz'),
      { status: 500 }
    )
  }
}
