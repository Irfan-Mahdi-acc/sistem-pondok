import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Define database schema
interface PondokCacheDB extends DBSchema {
  santri: {
    key: string
    value: any
    indexes: { nis: string; nama: string }
  }
  kelas: {
    key: string
    value: any
    indexes: { nama: string }
  }
  ustadz: {
    key: string
    value: any
    indexes: { nama: string }
  }
  jadwal: {
    key: string
    value: any
    indexes: { kelasId: string; ustadzId: string }
  }
  syncMeta: {
    key: string // dataType
    value: {
      dataType: string
      lastSynced: string // ISO timestamp
      recordCount: number
    }
  }
}

export type DataType = 'santri' | 'kelas' | 'ustadz' | 'jadwal'

class CacheDB {
  private db: IDBPDatabase<PondokCacheDB> | null = null
  private dbName = 'pondok-cache'
  private dbVersion = 1

  async init(): Promise<void> {
    if (this.db) return // Already initialized

    this.db = await openDB<PondokCacheDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Create santri store
        if (!db.objectStoreNames.contains('santri')) {
          const santriStore = db.createObjectStore('santri', { keyPath: 'id' })
          santriStore.createIndex('nis', 'nis')
          santriStore.createIndex('nama', 'nama')
        }

        // Create kelas store
        if (!db.objectStoreNames.contains('kelas')) {
          const kelasStore = db.createObjectStore('kelas', { keyPath: 'id' })
          kelasStore.createIndex('nama', 'nama')
        }

        // Create ustadz store
        if (!db.objectStoreNames.contains('ustadz')) {
          const ustadzStore = db.createObjectStore('ustadz', { keyPath: 'id' })
          ustadzStore.createIndex('nama', 'nama')
        }

        // Create jadwal store
        if (!db.objectStoreNames.contains('jadwal')) {
          const jadwalStore = db.createObjectStore('jadwal', { keyPath: 'id' })
          jadwalStore.createIndex('kelasId', 'kelasId')
          jadwalStore.createIndex('ustadzId', 'ustadzId')
        }

        // Create sync metadata store
        if (!db.objectStoreNames.contains('syncMeta')) {
          db.createObjectStore('syncMeta', { keyPath: 'dataType' })
        }
      },
    })
  }

  async getAll(storeName: DataType): Promise<any[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    return await this.db.getAll(storeName)
  }

  async putAll(storeName: DataType, data: any[]): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction(storeName, 'readwrite')
    
    // Clear existing data
    await tx.store.clear()
    
    // Add new data
    await Promise.all(data.map(item => tx.store.put(item)))
    await tx.done
  }

  async getSyncMeta(dataType: DataType): Promise<{ dataType: string; lastSynced: string; recordCount: number } | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    return await this.db.get('syncMeta', dataType)
  }

  async updateSyncMeta(dataType: DataType, lastSynced: string, recordCount: number): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    await this.db.put('syncMeta', { dataType, lastSynced, recordCount })
  }

  async getAllSyncMeta(): Promise<Record<DataType, { lastSynced: string; recordCount: number } | undefined>> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    const result: any = {}
    const dataTypes: DataType[] = ['santri', 'kelas', 'ustadz', 'jadwal']
    
    for (const type of dataTypes) {
      const meta = await this.getSyncMeta(type)
      result[type] = meta ? { lastSynced: meta.lastSynced, recordCount: meta.recordCount } : undefined
    }
    
    return result
  }

  async clearAll(): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const dataTypes: DataType[] = ['santri', 'kelas', 'ustadz', 'jadwal']
    for (const type of dataTypes) {
      await this.db.clear(type)
    }
    await this.db.clear('syncMeta')
  }
}

// Export singleton instance
export const cacheDB = new CacheDB()
