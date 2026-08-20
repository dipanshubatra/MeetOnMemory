/**
 * client/src/hooks/useOfflineQueue.js
 * React hook for consuming Offline Mutation Queue status, pending counts,
 * online/offline network connectivity, conflict logs, and manual sync controls.
 */

import { useState, useEffect, useCallback } from 'react'
import offlineQueueManager, {
  MUTATION_STATUS,
  CONFLICT_STRATEGY,
} from '../services/offlineQueue.js'

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [mutations, setMutations] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState(null)

  const refreshMutations = useCallback(async () => {
    try {
      const list = await offlineQueueManager.getAllMutations()
      setMutations(list)
      const count = list.filter(
        (m) => m.status === MUTATION_STATUS.PENDING || m.status === MUTATION_STATUS.PROCESSING,
      ).length
      setPendingCount(count)
    } catch (err) {
      console.error('[useOfflineQueue] Error refreshing mutations', err)
    }
  }, [])

  useEffect(() => {
    refreshMutations()

    const unsubscribeMutations = offlineQueueManager.subscribe((newList) => {
      setMutations(newList)
      const count = newList.filter(
        (m) => m.status === MUTATION_STATUS.PENDING || m.status === MUTATION_STATUS.PROCESSING,
      ).length
      setPendingCount(count)
    })

    const unsubscribeStatus = offlineQueueManager.subscribeStatus((event) => {
      if (event.action === 'NETWORK_CHANGE') {
        setIsOnline(event.isOnline)
      } else if (event.action === 'PROCESSING_START') {
        setIsSyncing(true)
      } else if (event.action === 'PROCESSING_COMPLETE') {
        setIsSyncing(false)
        setLastSyncResult({
          timestamp: new Date().toISOString(),
          successCount: event.successCount,
          failCount: event.failCount,
        })
        refreshMutations()
      } else if (
        event.action === 'MUTATION_SUCCESS' ||
        event.action === 'MUTATION_FAILED' ||
        event.action === 'MUTATION_CONFLICT'
      ) {
        refreshMutations()
      }
    })

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      unsubscribeMutations()
      unsubscribeStatus()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshMutations])

  const enqueue = useCallback(async (mutationConfig) => {
    return await offlineQueueManager.enqueueMutation(mutationConfig)
  }, [])

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      return { processed: 0, reason: 'Offline' }
    }
    setIsSyncing(true)
    try {
      const result = await offlineQueueManager.processQueue()
      return result
    } finally {
      setIsSyncing(false)
      refreshMutations()
    }
  }, [isOnline, refreshMutations])

  const removeMutation = useCallback(
    async (id) => {
      const res = await offlineQueueManager.removeMutation(id)
      await refreshMutations()
      return res
    },
    [refreshMutations],
  )

  const clearCompleted = useCallback(async () => {
    const res = await offlineQueueManager.clearCompletedMutations()
    await refreshMutations()
    return res
  }, [refreshMutations])

  return {
    isOnline,
    mutations,
    pendingCount,
    isSyncing,
    lastSyncResult,
    enqueue,
    triggerSync,
    removeMutation,
    clearCompleted,
    refreshMutations,
    MUTATION_STATUS,
    CONFLICT_STRATEGY,
  }
}

export default useOfflineQueue
