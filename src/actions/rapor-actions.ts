"use server"

import { prisma } from "@/lib/prisma"

export interface RaporData {
  santri: {
    id: string
    nis: string
    nama: string
    kelas: {
      id: string
      name: string
      level: string
    } | null
  }
  nilaiPerMapel: {
    mapelId: string
    mapelName: string
    nilaiList: {
      ujianId: string
      ujianName: string
      ujianType: string
      score: number
      date: Date
    }[]
    rataRata: number
  }[]
  rataRataKeseluruhan: number
  ranking?: number
}

export async function getRaporByLembaga(lembagaId: string, kelasId?: string) {
  try {
    // Get all santri in the lembaga, optionally filtered by kelas
    const santris = await prisma.santri.findMany({
      where: {
        lembagaId,
        ...(kelasId ? { kelasId } : {}),
        status: "ACTIVE"
      },
      include: {
        kelas: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        nilais: {
          include: {
            mapel: {
              select: {
                id: true,
                name: true
              }
            },
            ujian: {
              select: {
                id: true,
                name: true,
                type: true,
                date: true
              }
            }
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    })

    // Process data for each santri
    const raporDataList: RaporData[] = santris.map((santri: any) => {
      // Group nilai by mapel
      const nilaiByMapel = new Map<string, {
        mapelId: string
        mapelName: string
        nilaiList: {
          ujianId: string
          ujianName: string
          ujianType: string
          score: number
          date: Date
        }[]
      }>()

      santri.nilais.forEach((nilai: any) => {
        const mapelId = nilai.mapel.id
        if (!nilaiByMapel.has(mapelId)) {
          nilaiByMapel.set(mapelId, {
            mapelId,
            mapelName: nilai.mapel.name,
            nilaiList: []
          })
        }
        
        nilaiByMapel.get(mapelId)!.nilaiList.push({
          ujianId: nilai.ujian.id,
          ujianName: nilai.ujian.name,
          ujianType: nilai.ujian.type,
          score: nilai.score,
          date: nilai.ujian.date
        })
      })

      // Calculate average per mapel
      const nilaiPerMapel = Array.from(nilaiByMapel.values()).map(mapelData => {
        const totalScore = mapelData.nilaiList.reduce((sum, n) => sum + n.score, 0)
        const rataRata = mapelData.nilaiList.length > 0 
          ? totalScore / mapelData.nilaiList.length 
          : 0

        return {
          ...mapelData,
          rataRata
        }
      })

      // Calculate overall average
      const totalRataRata = nilaiPerMapel.reduce((sum, m) => sum + m.rataRata, 0)
      const rataRataKeseluruhan = nilaiPerMapel.length > 0 
        ? totalRataRata / nilaiPerMapel.length 
        : 0

      return {
        santri: {
          id: santri.id,
          nis: santri.nis,
          nama: santri.nama,
          kelas: santri.kelas
        },
        nilaiPerMapel,
        rataRataKeseluruhan
      }
    })

    // Calculate ranking based on overall average
    const sortedByAverage = [...raporDataList].sort((a, b) => 
      b.rataRataKeseluruhan - a.rataRataKeseluruhan
    )

    sortedByAverage.forEach((rapor, index) => {
      rapor.ranking = index + 1
    })

    return raporDataList
  } catch (error) {
    console.error("Error fetching rapor data:", error)
    throw new Error("Failed to fetch rapor data")
  }
}

export async function getRaporBySantri(santriId: string) {
  try {
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
      include: {
        kelas: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        lembaga: {
          select: {
            id: true,
            name: true,
            jenjang: true
          }
        },
        nilais: {
          include: {
            mapel: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            ujian: {
              select: {
                id: true,
                name: true,
                type: true,
                date: true
              }
            }
          },
          orderBy: {
            ujian: {
              date: 'desc'
            }
          }
        }
      }
    })

    if (!santri) {
      throw new Error("Santri not found")
    }

    // Group nilai by mapel
    const nilaiByMapel = new Map<string, {
      mapelId: string
      mapelName: string
      mapelCode: string | null
      nilaiList: {
        ujianId: string
        ujianName: string
        ujianType: string
        score: number
        date: Date
      }[]
    }>()

    santri.nilais.forEach((nilai: any) => {
      const mapelId = nilai.mapel.id
      if (!nilaiByMapel.has(mapelId)) {
        nilaiByMapel.set(mapelId, {
          mapelId,
          mapelName: nilai.mapel.name,
          mapelCode: nilai.mapel.code,
          nilaiList: []
        })
      }
      
      nilaiByMapel.get(mapelId)!.nilaiList.push({
        ujianId: nilai.ujian.id,
        ujianName: nilai.ujian.name,
        ujianType: nilai.ujian.type,
        score: nilai.score,
        date: nilai.ujian.date
      })
    })

    // Calculate average per mapel
    const nilaiPerMapel = Array.from(nilaiByMapel.values()).map(mapelData => {
      const totalScore = mapelData.nilaiList.reduce((sum, n) => sum + n.score, 0)
      const rataRata = mapelData.nilaiList.length > 0 
        ? totalScore / mapelData.nilaiList.length 
        : 0

      return {
        ...mapelData,
        rataRata
      }
    })

    // Calculate overall average
    const totalRataRata = nilaiPerMapel.reduce((sum, m) => sum + m.rataRata, 0)
    const rataRataKeseluruhan = nilaiPerMapel.length > 0 
      ? totalRataRata / nilaiPerMapel.length 
      : 0

    return {
      santri: {
        id: santri.id,
        nis: santri.nis,
        nama: santri.nama,
        kelas: santri.kelas,
        lembaga: santri.lembaga
      },
      nilaiPerMapel,
      rataRataKeseluruhan
    }
  } catch (error) {
    console.error("Error fetching santri rapor:", error)
    throw new Error("Failed to fetch santri rapor")
  }
}

export async function getKelasByLembaga(lembagaId: string) {
  try {
    const kelasList = await prisma.kelas.findMany({
      where: {
        lembagaId
      },
      select: {
        id: true,
        name: true,
        level: true,
        _count: {
          select: {
            santris: true
          }
        }
      },
      orderBy: {
        level: 'asc'
      }
    })

    return kelasList
  } catch (error) {
    console.error("Error fetching kelas:", error)
    throw new Error("Failed to fetch kelas")
  }
}
