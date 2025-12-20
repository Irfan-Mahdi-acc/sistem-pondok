import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, apiResponse } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate API Key
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const { id } = params

    const lembaga = await prisma.lembaga.findUnique({
      where: { id },
      include: {
        mudir: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        kelas: {
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
        _count: {
          select: {
            santris: true,
            kelas: true,
            academicYears: true
          }
        }
      }
    })

    if (!lembaga) {
      return NextResponse.json(
        apiResponse(false, null, 'Lembaga not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      apiResponse(true, lembaga),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/lembaga/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to fetch lembaga'),
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate API Key
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
    const { name, address, phone, email, logoUrl, jenjang, mudirId } = body

    // Check if lembaga exists
    const existing = await prisma.lembaga.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Lembaga not found'),
        { status: 404 }
      )
    }

    // Update lembaga
    const lembaga = await prisma.lembaga.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(jenjang !== undefined && { jenjang }),
        ...(mudirId !== undefined && { mudirId })
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
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/lembaga/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to update lembaga'),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate API Key
  const authResult = await validateApiKey(request)
  if (!authResult.isValid) {
    return NextResponse.json(
      apiResponse(false, null, authResult.error),
      { status: 401 }
    )
  }

  try {
    const { id } = params

    // Check if lembaga exists
    const existing = await prisma.lembaga.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            santris: true,
            kelas: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        apiResponse(false, null, 'Lembaga not found'),
        { status: 404 }
      )
    }

    // Check if lembaga has related data
    if (existing._count.santris > 0 || existing._count.kelas > 0) {
      return NextResponse.json(
        apiResponse(
          false,
          null,
          `Cannot delete lembaga with ${existing._count.santris} santris and ${existing._count.kelas} kelas. Please remove related data first.`
        ),
        { status: 400 }
      )
    }

    // Delete lembaga
    await prisma.lembaga.delete({ where: { id } })

    return NextResponse.json(
      apiResponse(true, { message: 'Lembaga deleted successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/lembaga/[id] error:', error)
    return NextResponse.json(
      apiResponse(false, null, 'Failed to delete lembaga'),
      { status: 500 }
    )
  }
}
