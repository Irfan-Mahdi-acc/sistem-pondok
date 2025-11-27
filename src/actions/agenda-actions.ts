'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAgendas() {
  return await prisma.agendaKantor.findMany({
    orderBy: { date: 'desc' }
  })
}

export async function getAgendaById(id: string) {
  return await prisma.agendaKantor.findUnique({
    where: { id }
  })
}

export async function createAgenda(formData: FormData) {
  try {
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      date: new Date(formData.get('date') as string),
      startTime: formData.get('startTime') as string || null,
      endTime: formData.get('endTime') as string || null,
      location: formData.get('location') as string || null,
      type: formData.get('type') as string,
      status: 'PLANNED',
    }

    await prisma.agendaKantor.create({ data })
    revalidatePath('/dashboard/kantor/agenda')
    return { success: true }
  } catch (error) {
    console.error('Create agenda error:', error)
    return { success: false, error: 'Gagal menambah agenda' }
  }
}

export async function updateAgenda(id: string, formData: FormData) {
  try {
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      date: new Date(formData.get('date') as string),
      startTime: formData.get('startTime') as string || null,
      endTime: formData.get('endTime') as string || null,
      location: formData.get('location') as string || null,
      type: formData.get('type') as string,
      status: formData.get('status') as string,
    }

    await prisma.agendaKantor.update({
      where: { id },
      data
    })
    
    revalidatePath('/dashboard/kantor/agenda')
    return { success: true }
  } catch (error) {
    console.error('Update agenda error:', error)
    return { success: false, error: 'Gagal mengupdate agenda' }
  }
}

export async function updateAgendaStatus(id: string, status: string) {
  try {
    await prisma.agendaKantor.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/dashboard/kantor/agenda')
    return { success: true }
  } catch (error) {
    console.error('Update status error:', error)
    return { success: false, error: 'Gagal mengupdate status' }
  }
}

export async function deleteAgenda(id: string) {
  try {
    await prisma.agendaKantor.delete({
      where: { id }
    })
    revalidatePath('/dashboard/kantor/agenda')
    return { success: true }
  } catch (error) {
    console.error('Delete agenda error:', error)
    return { success: false, error: 'Gagal menghapus agenda' }
  }
}

export async function getAgendaStats() {
  const agendas = await prisma.agendaKantor.findMany()
  
  return {
    total: agendas.length,
    planned: agendas.filter(a => a.status === 'PLANNED').length,
    ongoing: agendas.filter(a => a.status === 'ONGOING').length,
    completed: agendas.filter(a => a.status === 'COMPLETED').length,
  }
}


