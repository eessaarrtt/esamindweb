'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PRODUCTS, type ProductCode } from '@/lib/products'

interface Prompt {
  id: number
  productCode: string
  template: string
  category: string
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPrompts()
  }, [])

  async function loadPrompts() {
    try {
      setLoading(true)
      const res = await fetch('/api/prompts')
      if (!res.ok) throw new Error('Failed to load prompts')
      const data = await res.json()
      console.log(data.prompts)
      setPrompts(data.prompts)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number, productCode: string) {
    if (!confirm(`Delete prompt for ${productCode}?`)) return

    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete prompt')
      await loadPrompts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete prompt')
    }
  }

  // Группируем промпты по категориям
  const promptsByCategory = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) acc[prompt.category] = []
    acc[prompt.category].push(prompt)
    return acc
  }, {} as Record<string, Prompt[]>)

  // Получаем все productCode, для которых нет промптов
  const allProductCodes = Object.keys(PRODUCTS) as ProductCode[]
  const promptsProductCodes = new Set(prompts.map(p => p.productCode))
  const missingProductCodes = allProductCodes.filter(
    code => !promptsProductCodes.has(code)
  )

  const categoryLabels: Record<string, string> = {
    tarot: '🔮 Tarot & Divination',
    energy: '☕ Energy & Intuition',
    ritual: '✨ Rituals & Tools',
    premium: '🪄 Premium Packages',
  }

  if (loading) {
    return (
      <div className="text-[#f9fafb]">
        <h1 className="text-3xl font-serif text-[#f5e0c3] mb-6">Prompts</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="text-[#f9fafb]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-[#f5e0c3]">Prompts</h1>
        <Link
          href="/dashboard/prompts/new"
          className="px-4 py-2 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#d97706] transition-colors"
        >
          + Add Prompt
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Промпты по категориям */}
      {Object.entries(promptsByCategory).map(([category, categoryPrompts]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-[#f5e0c3] mb-4">
            {categoryLabels[category] || category}
          </h2>
          <div className="grid gap-4">
            {categoryPrompts.map((prompt) => {
              const product = PRODUCTS[prompt.productCode as ProductCode]
              return (
                <div
                  key={prompt.id}
                  className="bg-[#111827] border border-[#374151] rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-[#f5e0c3]">
                          {product?.title || prompt.productCode}
                        </h3>
                        {prompt.isCustom && (
                          <span className="px-2 py-1 text-xs bg-[#f59e0b]/20 text-[#f59e0b] rounded">
                            Custom
                          </span>
                        )}
                        <span className="px-2 py-1 text-xs bg-[#374151] text-[#9ca3af] rounded">
                          {prompt.category}
                        </span>
                      </div>
                      <p className="text-sm text-[#9ca3af] mb-2">
                        Code: <code className="text-[#f59e0b]">{prompt.productCode}</code>
                      </p>
                      <p className="text-sm text-[#d1d5db] line-clamp-2">
                        {prompt.template.substring(0, 200)}...
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/dashboard/prompts/${prompt.id}`}
                        className="px-3 py-1 bg-[#374151] text-[#f9fafb] rounded hover:bg-[#4b5563] transition-colors text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(prompt.id, prompt.productCode)}
                        className="px-3 py-1 bg-red-900/30 text-red-200 rounded hover:bg-red-900/50 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Промпты без кастомных шаблонов */}
      {missingProductCodes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#f5e0c3] mb-4">
            Products without custom prompts ({missingProductCodes.length})
          </h2>
          <div className="grid gap-2">
            {missingProductCodes.map((code) => {
              const product = PRODUCTS[code]
              return (
                <div
                  key={code}
                  className="bg-[#111827] border border-[#374151] rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-[#f5e0c3]">
                      {product?.title || code}
                    </h3>
                    <p className="text-sm text-[#9ca3af]">
                      Code: <code className="text-[#f59e0b]">{code}</code>
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/prompts/new?productCode=${code}`}
                    className="px-4 py-2 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#d97706] transition-colors"
                  >
                    Edit Prompt
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {prompts.length === 0 && missingProductCodes.length === 0 && (
        <div className="text-center py-12 text-[#9ca3af]">
          <p>No prompts found. Create your first prompt!</p>
        </div>
      )}
    </div>
  )
}

