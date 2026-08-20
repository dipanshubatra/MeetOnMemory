import React, { useState } from 'react'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useOfflineQueue } from '../../hooks/useOfflineQueue.js'

export const OfflineQueueManagerModal = ({ isOpen, onClose }) => {
  const {
    isOnline,
    mutations,
    pendingCount,
    isSyncing,
    lastSyncResult,
    enqueue,
    triggerSync,
    removeMutation,
    clearCompleted,
    MUTATION_STATUS,
  } = useOfflineQueue()

  const [activeTab, setActiveTab] = useState('all')
  const [testUrl, setTestUrl] = useState('/api/meetings')
  const [testMethod, setTestMethod] = useState('POST')
  const [testDescription, setTestDescription] = useState('Test offline action item update')

  if (!isOpen) return null

  const filteredMutations = mutations.filter((m) => {
    if (activeTab === 'pending')
      return m.status === MUTATION_STATUS.PENDING || m.status === MUTATION_STATUS.PROCESSING
    if (activeTab === 'completed') return m.status === MUTATION_STATUS.SUCCESS
    if (activeTab === 'failed')
      return m.status === MUTATION_STATUS.FAILED || m.status === MUTATION_STATUS.CONFLICT
    return true
  })

  const handleSimulateOfflineEnqueue = async (e) => {
    e.preventDefault()
    await enqueue({
      url: testUrl,
      method: testMethod,
      body: { title: 'Simulated offline payload', timestamp: Date.now() },
      entityType: 'meeting',
      description: testDescription,
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case MUTATION_STATUS.SUCCESS:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Synced
          </span>
        )
      case MUTATION_STATUS.PROCESSING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        )
      case MUTATION_STATUS.FAILED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Failed
          </span>
        )
      case MUTATION_STATUS.CONFLICT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            Conflict
          </span>
        )
      case MUTATION_STATUS.PENDING:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Queued
          </span>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Offline Mutation Queue
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <Wifi className="w-3 h-3" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                IndexedDB offline mutation queue & background sync manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerSync()}
              disabled={!isOnline || isSyncing || pendingCount === 0}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now ({pendingCount})
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {lastSyncResult && (
          <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>
              Last sync attempt: {new Date(lastSyncResult.timestamp).toLocaleTimeString()} —
              Success: <strong className="text-emerald-600">{lastSyncResult.successCount}</strong>,
              Failures: <strong className="text-rose-600">{lastSyncResult.failCount}</strong>
            </span>
            <button
              onClick={clearCompleted}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[11px]"
            >
              Clear Completed
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls & Filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({mutations.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'pending'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Synced
              </button>
              <button
                onClick={() => setActiveTab('failed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'failed'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Failed / Conflicts
              </button>
            </div>

            <button
              onClick={clearCompleted}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Synced
            </button>
          </div>

          {/* Mutations Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Action / Endpoint</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Retries</th>
                  <th className="p-3">Enqueued At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {filteredMutations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No mutations in queue for this view.
                    </td>
                  </tr>
                ) : (
                  filteredMutations.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.description}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.url}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.method}
                        </span>
                      </td>
                      <td className="p-3">{getStatusBadge(item.status)}</td>
                      <td className="p-3 text-slate-500">
                        {item.retryCount} / {item.maxRetries}
                      </td>
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeMutation(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Test / Simulation Panel */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Simulate Offline Mutation Queueing
            </h4>
            <form
              onSubmit={handleSimulateOfflineEnqueue}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Action description"
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="/api/endpoint"
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                Enqueue Offline Action
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfflineQueueManagerModal
