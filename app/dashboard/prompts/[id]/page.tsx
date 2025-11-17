'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PRODUCTS, type ProductCode } from '@/lib/products'

interface Prompt {
  id: number
  productCode: string
  template: string
  category: string
  isCustom: boolean
}

export default function EditPromptPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useCustomProductCode, setUseCustomProductCode] = useState(false)
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  const [prompt, setPrompt] = useState<Partial<Prompt>>({
    productCode: '',
    template: '',
    category: 'tarot',
    isCustom: true,
  })

  useEffect(() => {
    // Если редактирование, загружаем промпт
    if (!isNew) {
      loadPrompt()
    } else {
      // Если создание нового, проверяем productCode из query
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const productCode = urlParams.get('productCode')
        if (productCode && PRODUCTS[productCode as ProductCode]) {
          const product = PRODUCTS[productCode as ProductCode]
          setPrompt({
            productCode,
            category: product.category,
            template: '',
            isCustom: true,
          })
        }
      }
      setLoading(false)
    }
  }, [id, isNew])

  async function loadPrompt() {
    try {
      setLoading(true)
      console.log('🔍 Loading prompt, ID:', id)
      const res = await fetch(`/api/prompts/${id}`)
      console.log('📡 Response status:', res.status, res.statusText)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to load prompt')
      }
      
      const data = await res.json()
      console.log('✅ Data received from API:')
      console.log('   - Full response:', data)
      console.log('   - Prompt object:', data.prompt)
      console.log('   - Prompt ID:', data.prompt?.id)
      console.log('   - Product Code:', data.prompt?.productCode)
      console.log('   - Template length:', data.prompt?.template?.length)
      console.log('   - Template preview:', data.prompt?.template?.substring(0, 100))
      
      setPrompt(data.prompt)
      setError(null)
    } catch (err) {
      console.error('❌ Error loading prompt:', err)
      setError(err instanceof Error ? err.message : 'Failed to load prompt')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate() {
    if (!prompt.productCode) {
      alert('Please enter a product code first')
      return
    }

    // Проверяем, существует ли productCode в PRODUCTS
    if (!PRODUCTS[prompt.productCode as ProductCode]) {
      alert('Auto-generation is only available for existing product codes. Please create a custom template.')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode: prompt.productCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate prompt')
      }
      const data = await res.json()
      setPrompt({
        ...prompt,
        template: data.template,
        category: data.category,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate prompt')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    if (!prompt.productCode || !prompt.template || !prompt.category) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const url = isNew ? '/api/prompts' : `/api/prompts/${id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: prompt.productCode,
          template: prompt.template,
          category: prompt.category,
          isCustom: prompt.isCustom,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save prompt')
      }

      router.push('/dashboard/prompts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const allProductCodes = Object.keys(PRODUCTS) as ProductCode[]
  const selectedProduct = prompt.productCode
    ? PRODUCTS[prompt.productCode as ProductCode]
    : null

  if (loading) {
    return (
      <div className="text-[#f9fafb]">
        <h1 className="text-3xl font-serif text-[#f5e0c3] mb-6">
          Edit Prompt
        </h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="text-[#f9fafb] max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-[#f5e0c3]">
          Edit Prompt
        </h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#374151] text-[#f9fafb] rounded-lg hover:bg-[#4b5563] transition-colors"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="bg-[#111827] border border-[#374151] rounded-lg p-6 space-y-6">
        {/* Product Code */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-[#f5e0c3]">
              Product Code *
            </label>
            {isNew && (
              <label className="flex items-center gap-2 text-sm text-[#9ca3af]">
                <input
                  type="checkbox"
                  checked={useCustomProductCode}
                  onChange={(e) => {
                    setUseCustomProductCode(e.target.checked)
                    if (!e.target.checked) {
                      // Сбрасываем productCode при переключении на список
                      setPrompt({ ...prompt, productCode: '' })
                    }
                  }}
                  className="w-4 h-4 text-[#f59e0b] bg-[#1f2937] border-[#374151] rounded focus:ring-[#f59e0b]"
                />
                Custom code
              </label>
            )}
          </div>
          {isNew ? (
            useCustomProductCode ? (
              <input
                type="text"
                value={prompt.productCode || ''}
                onChange={(e) => setPrompt({ ...prompt, productCode: e.target.value })}
                placeholder="Enter custom product code (e.g., tarot_custom_reading)"
                className="w-full px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
              />
            ) : (
              <>
                <select
                  value={prompt.productCode || ''}
                  onChange={(e) => {
                    const code = e.target.value as ProductCode
                    const product = PRODUCTS[code]
                    setPrompt({
                      ...prompt,
                      productCode: code,
                      category: product?.category || 'tarot',
                    })
                  }}
                  className="w-full px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                >
                  <option value="">Select a product...</option>
                  {allProductCodes.map((code) => {
                    const product = PRODUCTS[code]
                    return (
                      <option key={code} value={code}>
                        {product.title} ({code})
                      </option>
                    )
                  })}
                </select>
                <p className="mt-2 text-xs text-[#9ca3af]">
                  Or enable "Custom code" to enter your own product code
                </p>
              </>
            )
          ) : (
            <input
              type="text"
              value={prompt.productCode || ''}
              disabled
              className="w-full px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#9ca3af] cursor-not-allowed"
            />
          )}
          {selectedProduct && (
            <p className="mt-2 text-sm text-[#9ca3af]">
              {selectedProduct.title} ({selectedProduct.category})
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-[#f5e0c3]">
              Category *
            </label>
            <label className="flex items-center gap-2 text-sm text-[#9ca3af]">
              <input
                type="checkbox"
                checked={useCustomCategory}
                onChange={(e) => setUseCustomCategory(e.target.checked)}
                className="w-4 h-4 text-[#f59e0b] bg-[#1f2937] border-[#374151] rounded focus:ring-[#f59e0b]"
              />
              Custom category
            </label>
          </div>
          {useCustomCategory ? (
            <input
              type="text"
              value={prompt.category || ''}
              onChange={(e) => setPrompt({ ...prompt, category: e.target.value })}
              placeholder="Enter custom category (e.g., astrology, numerology)"
              className="w-full px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
            />
          ) : (
            <>
              <select
                value={prompt.category || 'tarot'}
                onChange={(e) => setPrompt({ ...prompt, category: e.target.value })}
                className="w-full px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
              >
                <option value="tarot">Tarot & Divination</option>
                <option value="energy">Energy & Intuition</option>
                <option value="ritual">Rituals & Tools</option>
                <option value="premium">Premium Packages</option>
              </select>
              <p className="mt-2 text-xs text-[#9ca3af]">
                Or enable "Custom category" to enter your own category
              </p>
            </>
          )}
        </div>

        {/* Template */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-[#f5e0c3]">
              Template *
            </label>
            {isNew && prompt.productCode && PRODUCTS[prompt.productCode as ProductCode] && (
              <button
                onClick={handleGenerate}
                disabled={saving}
                className="px-3 py-1 text-sm bg-[#374151] text-[#f9fafb] rounded hover:bg-[#4b5563] transition-colors disabled:opacity-50"
              >
                {saving ? 'Generating...' : 'Auto-generate'}
              </button>
            )}
          </div>
          <textarea
            value={prompt.template }
            onChange={(e) => setPrompt({ ...prompt, template: e.target.value })}
            rows={20}
            className="w-full px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#f9fafb] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
            placeholder="Enter prompt template. Use ${input.name ?? 'not provided'}, ${input.age ?? 'not provided'}, ${input.question ?? 'not clearly stated'}, ${input.rawPersonalization ?? ''} as placeholders."
          />
          <p className="mt-2 text-xs text-[#9ca3af]">
            Use placeholders: <code className="text-[#f59e0b]">$&#123;input.name ?? 'not provided'&#125;</code>,{' '}
            <code className="text-[#f59e0b">$&#123;input.age ?? 'not provided'&#125;</code>,{' '}
            <code className="text-[#f59e0b">$&#123;input.question ?? 'not clearly stated'&#125;</code>,{' '}
            <code className="text-[#f59e0b">$&#123;input.rawPersonalization ?? ''&#125;</code>
          </p>
        </div>

        {/* Is Custom */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isCustom"
            checked={prompt.isCustom ?? true}
            onChange={(e) => setPrompt({ ...prompt, isCustom: e.target.checked })}
            className="w-4 h-4 text-[#f59e0b] bg-[#1f2937] border-[#374151] rounded focus:ring-[#f59e0b]"
          />
          <label htmlFor="isCustom" className="text-sm text-[#f9fafb]">
            Custom prompt (vs auto-generated)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving || !prompt.productCode || !prompt.template}
            className="px-6 py-2 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#d97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#374151] text-[#f9fafb] rounded-lg hover:bg-[#4b5563] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

