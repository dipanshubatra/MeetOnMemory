/**
 * client/src/services/offlineQueue.js
 * Comprehensive Offline Mutation Queue Service for MeetOnMemory.
 * Manages IndexedDB mutation storage, network monitoring, conflict resolution strategies,
 * background sync triggering, and broadcast communication with clients & Service Workers.
 */

const DB_NAME = 'MeetOnMemory_OfflineDB'
const DB_VERSION = 2
const MUTATION_STORE = 'mutationsQueue'
const CACHE_STORE = 'offlineCache'
const CONFLIC_LOG_STORE = 'conflictLogs'

export const MUTATION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CONFLICT: 'CONFLICT',
}

export const CONFLICT_STRATEGY = {
  CLIENT_WINS: 'CLIENT_WINS',
  SERVER_WINS: 'SERVER_WINS',
  MANUAL_RESOLVE: 'MANUAL_RESOLVE',
  MERGE: 'MERGE',
}

export class OfflineQueueManager {
  constructor() {
    this.db = null
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    this.listeners = new Set()
    this.statusListeners = new Set()
    this.broadcastChannel =
      typeof window !== 'undefined' && 'BroadcastChannel' in window
        ? new BroadcastChannel('meet_on_memory_offline_sync')
        : null

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineStateChange(true))
      window.addEventListener('offline', () => this.handleOnlineStateChange(false))
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_STATUS_UPDATE') {
          this.notifyStatusListeners(event.data.payload)
        }
      }
    }

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_SYNC_UPDATE') {
          this.notifyStatusListeners(event.data.payload)
        }
      })
    }
  }

  async getDB() {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB is not supported in this environment'))
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        if (!db.objectStoreNames.contains(MUTATION_STORE)) {
          const store = db.createObjectStore(MUTATION_STORE, {
            keyPath: 'id',
            autoIncrement: false,
          })
          store.createIndex('status', 'status', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('entityType', 'entityType', { unique: false })
          store.createIndex('entityId', 'entityId', { unique: false })
        }

        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' })
          cacheStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(CONFLIC_LOG_STORE)) {
          const conflictStore = db.createObjectStore(CONFLIC_LOG_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          })
          conflictStore.createIndex('mutationId', 'mutationId', { unique: false })
        }
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onerror = (event) => {
        console.error('[OfflineQueue] Failed to open database', event.target.error)
        reject(event.target.error)
      }
    })
  }

  generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return 'opt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9)
  }

  async enqueueMutation({
    url,
    method = 'POST',
    headers = {},
    body = null,
    entityType = 'generic',
    entityId = null,
    conflictStrategy = CONFLICT_STRATEGY.CLIENT_WINS,
    description = '',
    clientState = null,
  }) {
    const db = await this.getDB()
    const mutationId = this.generateUUID()

    const mutationRecord = {
      id: mutationId,
      url,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      rawBody: body,
      entityType,
      entityId,
      conflictStrategy,
      description: description || `${method.toUpperCase()} ${url}`,
      clientState,
      status: MUTATION_STATUS.PENDING,
      retryCount: 0,
      maxRetries: 5,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      lastAttemptAt: null,
      errorDetails: null,
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction([MUTATION_STORE], 'readwrite')
      const store = tx.objectStore(MUTATION_STORE)
      const req = store.add(mutationRecord)

      req.onsuccess = async () => {
        this.notifyListeners()
        this.notifyStatusListeners({
          action: 'ENQUEUED',
          mutation: mutationRecord,
        })

        // Trigger Service Worker background sync if supported
        await this.requestBackgroundSync()

        // If online right now, kick off execution
        if (this.isOnline) {
          this.processQueue()
        }

        resolve(mutationRecord)
      }

      req.onerror = (event) => {
        console.error('[OfflineQueue] Failed to enqueue mutation', event.target.error)
        reject(event.target.error)
      }
    })
  }

  async requestBackgroundSync() {
    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      'SyncManager' in window
    ) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('sync-mutations')
        console.log('[OfflineQueue] Registered background sync tag: sync-mutations')
      } catch (err) {
        console.warn('[OfflineQueue] Background sync registration skipped', err)
      }
    }
  }

  async getAllMutations() {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([MUTATION_STORE], 'readonly')
      const store = tx.objectStore(MUTATION_STORE)
      const req = store.getAll()

      req.onsuccess = () => {
        const mutations = req.result || []
        mutations.sort((a, b) => a.timestamp - b.timestamp)
        resolve(mutations)
      }

      req.onerror = (event) => reject(event.target.error)
    })
  }

  async getPendingCount() {
    const mutations = await this.getAllMutations()
    return mutations.filter(
      (m) => m.status === MUTATION_STATUS.PENDING || m.status === MUTATION_STATUS.PROCESSING,
    ).length
  }

  async clearCompletedMutations() {
    const db = await this.getDB()
    const mutations = await this.getAllMutations()
    const completed = mutations.filter(
      (m) =>
        m.status === MUTATION_STATUS.SUCCESS ||
        (m.status === MUTATION_STATUS.FAILED && m.retryCount >= m.maxRetries),
    )

    const tx = db.transaction([MUTATION_STORE], 'readwrite')
    const store = tx.objectStore(MUTATION_STORE)

    for (const item of completed) {
      store.delete(item.id)
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        this.notifyListeners()
        resolve(completed.length)
      }
      tx.onerror = (event) => reject(event.target.error)
    })
  }

  async removeMutation(id) {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([MUTATION_STORE], 'readwrite')
      const store = tx.objectStore(MUTATION_STORE)
      const req = store.delete(id)

      req.onsuccess = () => {
        this.notifyListeners()
        resolve(true)
      }
      req.onerror = (event) => reject(event.target.error)
    })
  }

  async updateMutationStatus(id, updates) {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([MUTATION_STORE], 'readwrite')
      const store = tx.objectStore(MUTATION_STORE)
      const getReq = store.get(id)

      getReq.onsuccess = () => {
        const item = getReq.result
        if (!item) return resolve(null)

        const updatedItem = { ...item, ...updates }
        const putReq = store.put(updatedItem)

        putReq.onsuccess = () => {
          this.notifyListeners()
          resolve(updatedItem)
        }
        putReq.onerror = (err) => reject(err)
      }

      getReq.onerror = (err) => reject(err)
    })
  }

  async processQueue() {
    if (!this.isOnline) return { processed: 0, reason: 'Offline' }

    const mutations = await this.getAllMutations()
    const pending = mutations.filter(
      (m) =>
        m.status === MUTATION_STATUS.PENDING ||
        (m.status === MUTATION_STATUS.FAILED && m.retryCount < m.maxRetries),
    )

    if (pending.length === 0) return { processed: 0, reason: 'No pending mutations' }

    let successCount = 0
    let failCount = 0

    this.notifyStatusListeners({
      action: 'PROCESSING_START',
      total: pending.length,
    })

    for (const mutation of pending) {
      if (!this.isOnline) break

      await this.updateMutationStatus(mutation.id, {
        status: MUTATION_STATUS.PROCESSING,
        lastAttemptAt: new Date().toISOString(),
      })

      try {
        const result = await this.executeMutation(mutation)

        if (result.success) {
          await this.updateMutationStatus(mutation.id, {
            status: MUTATION_STATUS.SUCCESS,
            response: result.data,
          })
          successCount++

          this.notifyStatusListeners({
            action: 'MUTATION_SUCCESS',
            mutationId: mutation.id,
            data: result.data,
          })
        } else if (result.isConflict) {
          await this.handleConflict(mutation, result.serverData)
          failCount++
        } else {
          const nextRetry = mutation.retryCount + 1
          const newStatus =
            nextRetry >= mutation.maxRetries ? MUTATION_STATUS.FAILED : MUTATION_STATUS.PENDING

          await this.updateMutationStatus(mutation.id, {
            status: newStatus,
            retryCount: nextRetry,
            errorDetails: result.error,
          })
          failCount++

          this.notifyStatusListeners({
            action: 'MUTATION_FAILED',
            mutationId: mutation.id,
            error: result.error,
            willRetry: nextRetry < mutation.maxRetries,
          })
        }
      } catch (err) {
        console.error('[OfflineQueue] Error processing mutation', mutation.id, err)
        const nextRetry = mutation.retryCount + 1
        await this.updateMutationStatus(mutation.id, {
          status:
            nextRetry >= mutation.maxRetries ? MUTATION_STATUS.FAILED : MUTATION_STATUS.PENDING,
          retryCount: nextRetry,
          errorDetails: err.message,
        })
        failCount++
      }
    }

    this.notifyStatusListeners({
      action: 'PROCESSING_COMPLETE',
      successCount,
      failCount,
    })

    return { processed: pending.length, successCount, failCount }
  }

  async executeMutation(mutation) {
    const authHeaders = this.getAuthHeaders()
    const finalHeaders = {
      ...mutation.headers,
      ...authHeaders,
    }

    try {
      const response = await fetch(mutation.url, {
        method: mutation.method,
        headers: finalHeaders,
        body: mutation.method !== 'GET' ? mutation.body : undefined,
      })

      const contentType = response.headers.get('content-type')
      let data = null
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (response.ok) {
        return { success: true, data }
      }

      if (response.status === 409 || response.status === 412) {
        return { isConflict: true, serverData: data }
      }

      return {
        success: false,
        status: response.status,
        error: data?.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network request failed',
      }
    }
  }

  async handleConflict(mutation, serverData) {
    const db = await this.getDB()
    const strategy = mutation.conflictStrategy || CONFLICT_STRATEGY.CLIENT_WINS

    // Log conflict
    const tx = db.transaction([CONFLIC_LOG_STORE], 'readwrite')
    tx.objectStore(CONFLIC_LOG_STORE).add({
      mutationId: mutation.id,
      entityType: mutation.entityType,
      entityId: mutation.entityId,
      clientState: mutation.rawBody,
      serverData,
      strategy,
      timestamp: Date.now(),
    })

    if (strategy === CONFLICT_STRATEGY.CLIENT_WINS) {
      // Force update with client state by adding override header
      const overrideHeaders = {
        ...mutation.headers,
        'X-Conflict-Override': 'true',
      }
      await this.updateMutationStatus(mutation.id, {
        headers: overrideHeaders,
        status: MUTATION_STATUS.PENDING,
        retryCount: mutation.retryCount + 1,
      })
    } else if (strategy === CONFLICT_STRATEGY.SERVER_WINS) {
      // Discard client mutation and mark as resolved/failed
      await this.updateMutationStatus(mutation.id, {
        status: MUTATION_STATUS.CONFLICT,
        errorDetails: 'Server version accepted over client mutation',
      })
    } else {
      // Manual resolve - mark as conflict and alert UI
      await this.updateMutationStatus(mutation.id, {
        status: MUTATION_STATUS.CONFLICT,
        serverData,
      })
    }

    this.notifyStatusListeners({
      action: 'MUTATION_CONFLICT',
      mutationId: mutation.id,
      strategy,
      serverData,
    })
  }

  getAuthHeaders() {
    const headers = {}
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    return headers
  }

  handleOnlineStateChange(onlineStatus) {
    this.isOnline = onlineStatus
    this.notifyStatusListeners({
      action: 'NETWORK_CHANGE',
      isOnline: onlineStatus,
    })

    if (onlineStatus) {
      console.log('[OfflineQueue] Connectivity restored. Auto-flushing queue...')
      this.processQueue()
    }
  }

  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  subscribeStatus(callback) {
    this.statusListeners.add(callback)
    return () => this.statusListeners.delete(callback)
  }

  notifyListeners() {
    this.getAllMutations().then((mutations) => {
      this.listeners.forEach((cb) => cb(mutations))
    })
  }

  notifyStatusListeners(payload) {
    this.statusListeners.forEach((cb) => cb(payload))
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SYNC_STATUS_UPDATE',
        payload,
      })
    }
  }
}

export const offlineQueueManager = new OfflineQueueManager()
export default offlineQueueManager
