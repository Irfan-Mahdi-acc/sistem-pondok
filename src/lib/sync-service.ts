import { cacheDB, DataType } from './cache-db'

interface UpdateStatus {
  hasStaleData: boolean
  updates: Record<DataType, {
    needsSync: boolean
    serverTime: string
    clientTime?: string
    recordCount: number
  }>
}

class SyncService {
  private isSyncing = false

  /**
   * Check if any data needs synchronization
   */
  async checkUpdates(): Promise<UpdateStatus> {
    try {
      // Get client timestamps from IndexedDB
      const clientMeta = await cacheDB.getAllSyncMeta()

      // Get server timestamps from API
      const response = await fetch('/api/sync/check-updates')
      if (!response.ok) throw new Error('Failed to check updates')
      
      const serverMeta = await response.json()

      // Compare timestamps
      const updates: any = {}
      let hasStaleData = false

      const dataTypes: DataType[] = ['santri', 'kelas', 'ustadz', 'jadwal']
      
      for (const type of dataTypes) {
        const serverTime = serverMeta.updates[type]?.lastModified
        const clientTime = clientMeta[type]?.lastSynced
        
        const needsSync = !clientTime || (serverTime && new Date(serverTime) > new Date(clientTime))
        
        if (needsSync) hasStaleData = true

        updates[type] = {
          needsSync,
          serverTime: serverTime || new Date().toISOString(),
          clientTime,
          recordCount: serverMeta.updates[type]?.recordCount || 0
        }
      }

      return { hasStaleData, updates }
    } catch (error) {
      console.error('Check updates error:', error)
      return {
        hasStaleData: false,
        updates: {} as any
      }
    }
  }

  /**
   * Sync specific data type
   */
  async syncDataType(type: DataType): Promise<boolean> {
    try {
      // Fetch data from server
      const response = await fetch(`/api/sync/data/${type}`)
      
      if (!response.ok) {
        // If 400/404, model might not exist - skip silently
        if (response.status === 400 || response.status === 404) {
          console.log(`Skipping ${type} - model not available yet`)
          return false
        }
        throw new Error(`Failed to sync ${type}: ${response.status}`)
      }

      const result = await response.json()

      // Save to IndexedDB
      await cacheDB.putAll(type, result.data)
      await cacheDB.updateSyncMeta(type, result.lastModified, result.recordCount)

      console.log(`✅ Synced ${type}: ${result.recordCount} records`)
      return true
    } catch (error) {
      console.error(`Sync ${type} error:`, error)
      return false
    }
  }

  /**
   * Sync all master data
   */
  async syncAll(): Promise<void> {
    if (this.isSyncing) return // Prevent concurrent syncs

    this.isSyncing = true

    try {
      const dataTypes: DataType[] = ['santri', 'kelas', 'ustadz', 'jadwal']
      
      // Sync all in parallel, but don't fail if some are missing
      const results = await Promise.allSettled(
        dataTypes.map(type => this.syncDataType(type))
      )
      
      // Log results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
      console.log(`Sync complete: ${successful}/${dataTypes.length} data types synced`)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Get data (cache-first)
   */
  async getData(type: DataType): Promise<any[]> {
    try {
      // Always load from cache first
      const cached = await cacheDB.getAll(type)
      
      // If cache is empty, trigger sync
      if (cached.length === 0) {
        await this.syncDataType(type)
        return await cacheDB.getAll(type)
      }

      return cached
    } catch (error) {
      console.error(`Get ${type} data error:`, error)
      return []
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    await cacheDB.clearAll()
  }
}

// Export singleton instance
export const syncService = new SyncService()
