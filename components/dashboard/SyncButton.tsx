'use client'

import { useState } from 'react'

export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    newOrders: number
    skipped: number
    errors: number
  } | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        alert('Sync failed: ' + (data.error || 'Unknown error'))
        return
      }

      setResult(data)
      window.location.reload()
    } catch (error) {
      alert('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={loading}
        className="px-6 py-3 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#fbbf24] transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Syncing...' : 'Sync Orders Now'}
      </button>
      {result && (
        <div className="mt-2 text-sm text-[#c58b5b]">
          New: {result.newOrders} | Skipped: {result.skipped} | Errors: {result.errors}
        </div>
      )}
    </div>
  )
}

