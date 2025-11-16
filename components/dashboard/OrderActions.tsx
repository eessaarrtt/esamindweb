'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
  id: number
  status: string
  readingText: string | null
}

export function OrderActions({ order }: { order: Order }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/readings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Generation failed')
        return
      }

      router.refresh()
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkSent() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${order.id}/mark-sent`, {
        method: 'POST',
      })

      if (!res.ok) {
        setError('Failed to mark as sent')
        return
      }

      router.refresh()
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyToClipboard() {
    if (!order.readingText) {
      alert('No reading to copy')
      return
    }

    navigator.clipboard.writeText(order.readingText)
    alert('Reading copied to clipboard!')
  }

  return (
    <div className="bg-[#111827] p-6 rounded-lg">
      <h2 className="text-2xl font-serif text-[#f5e0c3] mb-4">Actions</h2>
      {error && <div className="text-red-400 mb-4">{error}</div>}
      <div className="flex gap-4 flex-wrap">
        {!order.readingText ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#fbbf24] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Reading'}
          </button>
        ) : (
          <>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#fbbf24] transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="px-6 py-3 border border-[#f59e0b] text-[#f59e0b] rounded-lg hover:bg-[#f59e0b] hover:text-[#050409] transition-colors font-medium"
            >
              Copy to Clipboard
            </button>
            {order.status !== 'SENT' && (
              <button
                onClick={handleMarkSent}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                Mark as Sent
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

