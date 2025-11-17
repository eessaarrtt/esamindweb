'use client'

import { useEffect, useState } from 'react'

interface Stats {
  period: string
  orders: {
    total: number
    pending: number
    generated: number
    sent: number
    error: number
    byStatus: Array<{ status: string; count: number }>
    byShop: Array<{ shopId: number; shopName: string; count: number }>
    byProduct: Array<{ productCode: string; count: number }>
    byDay: Array<{ date: string; count: number }>
  }
  shops: {
    total: number
  }
  prompts: {
    total: number
    byCategory: Array<{ category: string; count: number }>
  }
  openai: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: {
      total: number
      fromSavedData: number
      estimated: number
    }
    generatedReadings: number
    withSavedData: number
    withoutSavedData: number
  }
  recentOrders: Array<{
    id: number
    productCode: string
    shopName: string
    status: string
    createdAt: string
  }>
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    loadStats()
  }, [period])

  async function loadStats() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/stats?period=${period}`)
      if (!res.ok) throw new Error('Failed to load stats')
      const data = await res.json()
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount)
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (loading) {
    return (
      <div className="text-[#f9fafb]">
        <h1 className="text-3xl font-serif text-[#f5e0c3] mb-6">Statistics & Costs</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-[#f9fafb]">
        <h1 className="text-3xl font-serif text-[#f5e0c3] mb-6">Statistics & Costs</h1>
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-200">
          {error}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="text-[#f9fafb] space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-[#f5e0c3]">Statistics & Costs</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] p-6 rounded-lg border border-[#374151]">
          <div className="text-[#c58b5b] text-sm mb-2">Total Orders</div>
          <div className="text-3xl font-bold text-[#f9fafb]">{formatNumber(stats.orders.total)}</div>
        </div>
        <div className="bg-[#111827] p-6 rounded-lg border border-[#374151]">
          <div className="text-[#c58b5b] text-sm mb-2">Generated</div>
          <div className="text-3xl font-bold text-[#fbbf24]">{formatNumber(stats.orders.generated)}</div>
        </div>
        <div className="bg-[#111827] p-6 rounded-lg border border-[#374151]">
          <div className="text-[#c58b5b] text-sm mb-2">OpenAI Cost</div>
          <div className="text-3xl font-bold text-[#f59e0b]">
            {formatCurrency(stats.openai.cost.total)}
          </div>
        </div>
        <div className="bg-[#111827] p-6 rounded-lg border border-[#374151]">
          <div className="text-[#c58b5b] text-sm mb-2">Total Tokens</div>
          <div className="text-3xl font-bold text-[#f9fafb]">
            {formatNumber(stats.openai.totalTokens)}
          </div>
        </div>
      </div>

      {/* OpenAI расходы */}
      <div className="bg-[#111827] border border-[#374151] rounded-lg p-6">
        <h2 className="text-2xl font-serif text-[#f5e0c3] mb-4">OpenAI Usage & Costs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#1f2937] p-4 rounded-lg">
            <div className="text-[#9ca3af] text-sm mb-1">Input Tokens</div>
            <div className="text-2xl font-bold text-[#f9fafb]">
              {formatNumber(stats.openai.inputTokens)}
            </div>
            <div className="text-xs text-[#9ca3af] mt-1">
              Real data from API
            </div>
          </div>
          <div className="bg-[#1f2937] p-4 rounded-lg">
            <div className="text-[#9ca3af] text-sm mb-1">Output Tokens</div>
            <div className="text-2xl font-bold text-[#f9fafb]">
              {formatNumber(stats.openai.outputTokens)}
            </div>
            <div className="text-xs text-[#9ca3af] mt-1">
              Real data from API
            </div>
          </div>
          <div className="bg-[#1f2937] p-4 rounded-lg">
            <div className="text-[#9ca3af] text-sm mb-1">Generated Readings</div>
            <div className="text-2xl font-bold text-[#fbbf24]">
              {formatNumber(stats.openai.generatedReadings)}
            </div>
            <div className="text-xs text-[#9ca3af] mt-1">
              {stats.openai.withSavedData} with data, {stats.openai.withoutSavedData} estimated
            </div>
          </div>
        </div>
        <div className="bg-[#1f2937] p-4 rounded-lg mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#9ca3af] text-sm">Total Cost (Real Data)</span>
            <span className="text-xl font-bold text-[#f59e0b]">
              {formatCurrency(stats.openai.cost.fromSavedData)}
            </span>
          </div>
          {stats.openai.cost.estimated > 0 && (
            <div className="flex justify-between items-center text-xs text-[#9ca3af]">
              <span>+ Estimated (old orders)</span>
              <span>{formatCurrency(stats.openai.cost.estimated)}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#374151]">
            <span className="text-[#f5e0c3] font-semibold">Total Cost</span>
            <span className="text-2xl font-bold text-[#f59e0b]">
              {formatCurrency(stats.openai.cost.total)}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#9ca3af] mt-2">
          * Costs are calculated from real OpenAI API usage data. Old orders without saved data are estimated.
        </p>
      </div>

      {/* Статистика по заказам */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* По статусам */}
        <div className="bg-[#111827] border border-[#374151] rounded-lg p-6">
          <h2 className="text-xl font-serif text-[#f5e0c3] mb-4">Orders by Status</h2>
          <div className="space-y-2">
            {stats.orders.byStatus.map((s) => (
              <div key={s.status} className="flex justify-between items-center">
                <span className="text-[#f9fafb] capitalize">{s.status}</span>
                <span className="text-[#f59e0b] font-semibold">{formatNumber(s.count)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* По магазинам */}
        <div className="bg-[#111827] border border-[#374151] rounded-lg p-6">
          <h2 className="text-xl font-serif text-[#f5e0c3] mb-4">Orders by Shop</h2>
          <div className="space-y-2">
            {stats.orders.byShop
              .sort((a, b) => b.count - a.count)
              .map((s) => (
                <div key={s.shopId} className="flex justify-between items-center">
                  <span className="text-[#f9fafb] truncate">{s.shopName}</span>
                  <span className="text-[#f59e0b] font-semibold">{formatNumber(s.count)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Топ продуктов */}
      <div className="bg-[#111827] border border-[#374151] rounded-lg p-6">
        <h2 className="text-xl font-serif text-[#f5e0c3] mb-4">Top Products</h2>
        <div className="space-y-2">
          {stats.orders.byProduct.length > 0 ? (
            stats.orders.byProduct.map((p) => (
              <div key={p.productCode} className="flex justify-between items-center">
                <span className="text-[#f9fafb] font-mono text-sm">{p.productCode}</span>
                <span className="text-[#f59e0b] font-semibold">{formatNumber(p.count)}</span>
              </div>
            ))
          ) : (
            <p className="text-[#9ca3af]">No orders yet</p>
          )}
        </div>
      </div>

      {/* Промпты по категориям */}
      <div className="bg-[#111827] border border-[#374151] rounded-lg p-6">
        <h2 className="text-xl font-serif text-[#f5e0c3] mb-4">Prompts by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.prompts.byCategory.map((c) => (
            <div key={c.category} className="bg-[#1f2937] p-4 rounded-lg">
              <div className="text-[#9ca3af] text-sm mb-1 capitalize">{c.category}</div>
              <div className="text-2xl font-bold text-[#f9fafb]">{formatNumber(c.count)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-[#9ca3af]">
          Total Prompts: <span className="text-[#f59e0b] font-semibold">{formatNumber(stats.prompts.total)}</span>
        </div>
      </div>

      {/* Заказы по дням (график) */}
      {stats.orders.byDay.length > 0 && (
        <div className="bg-[#111827] border border-[#374151] rounded-lg p-6">
          <h2 className="text-xl font-serif text-[#f5e0c3] mb-4">Orders Over Time (Last 30 Days)</h2>
          <div className="space-y-2">
            {stats.orders.byDay.slice(0, 30).map((d) => {
              const maxCount = Math.max(...stats.orders.byDay.map((day) => day.count))
              const percentage = maxCount > 0 ? (d.count / maxCount) * 100 : 0
              return (
                <div key={d.date} className="flex items-center gap-4">
                  <div className="text-[#9ca3af] text-sm w-24">
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-[#1f2937] rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-[#f59e0b] h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-[#f9fafb] font-semibold w-12 text-right">{d.count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

