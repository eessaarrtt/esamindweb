'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRODUCTS, type ProductCode } from '@/lib/products'

interface EtsyListing {
  id: number
  etsyListingId: string
  title: string
  productCode: string
  shop: {
    id: number
    name: string
  }
}

interface Shop {
  id: number
  name: string
}

export default function ListingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<EtsyListing[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShopId, setSelectedShopId] = useState<string>(
    searchParams.get('shopId') || ''
  )
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    loadShops()
    loadListings()
  }, [])

  useEffect(() => {
    loadListings()
    // Обновляем URL при изменении фильтра
    if (selectedShopId) {
      router.replace(`/dashboard/listings?shopId=${selectedShopId}`, {
        scroll: false,
      })
    } else {
      router.replace('/dashboard/listings', { scroll: false })
    }
  }, [selectedShopId])

  async function loadShops() {
    try {
      const res = await fetch('/api/shops')
      const data = await res.json()
      setShops(data.shops || [])
    } catch (error) {
      console.error('Failed to load shops', error)
    }
  }

  async function loadListings() {
    setLoading(true)
    try {
      const url = selectedShopId
        ? `/api/listings?shopId=${selectedShopId}`
        : '/api/listings'
      const res = await fetch(url)
      const data = await res.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Failed to load listings', error)
    } finally {
      setLoading(false)
    }
  }

  async function syncListings(shopId: number) {
    setSyncing(shopId)
    try {
      const res = await fetch(`/api/shops/${shopId}/listings/sync`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        alert(`Ошибка синхронизации: ${data.error}`)
        return
      }

      alert(
        `Синхронизация завершена!\nСоздано: ${data.created}\nОбновлено: ${data.updated}\nПропущено: ${data.skipped}`
      )
      loadListings()
    } catch (error) {
      console.error('Failed to sync listings', error)
      alert('Ошибка при синхронизации листингов')
    } finally {
      setSyncing(null)
    }
  }

  async function updateProductCode(listingId: number, productCode: ProductCode) {
    setUpdating(listingId)
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(`Ошибка обновления: ${data.error}`)
        return
      }

      // Обновляем локальное состояние
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? { ...listing, productCode }
            : listing
        )
      )
    } catch (error) {
      console.error('Failed to update product code', error)
      alert('Ошибка при обновлении product code')
    } finally {
      setUpdating(null)
    }
  }

  const allProductCodes = Object.keys(PRODUCTS) as ProductCode[]
  const groupedByCategory = {
    tarot: allProductCodes.filter((code) => PRODUCTS[code].category === 'tarot'),
    energy: allProductCodes.filter((code) => PRODUCTS[code].category === 'energy'),
    ritual: allProductCodes.filter((code) => PRODUCTS[code].category === 'ritual'),
    premium: allProductCodes.filter((code) => PRODUCTS[code].category === 'premium'),
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif text-[#f5e0c3]">Listings Mapping</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#374151] text-[#f9fafb] rounded-lg hover:bg-[#4b5563] transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Фильтр по магазину */}
      <div className="bg-[#111827] p-4 rounded-lg border border-[#374151]">
        <label className="block text-sm font-medium text-[#f5e0c3] mb-2">
          Filter by Shop
        </label>
        <div className="flex gap-4">
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
          >
            <option value="">All Shops</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          {selectedShopId && (
            <button
              onClick={() => syncListings(parseInt(selectedShopId))}
              disabled={syncing !== null}
              className="px-4 py-2 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#d97706] transition-colors disabled:opacity-50"
            >
              {syncing === parseInt(selectedShopId)
                ? 'Syncing...'
                : 'Sync Listings from Etsy'}
            </button>
          )}
        </div>
      </div>

      {/* Список листингов */}
      {loading ? (
        <div className="text-center text-[#c58b5b] py-12">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="bg-[#111827] p-12 rounded-lg text-center border border-[#374151]">
          <p className="text-[#c58b5b] mb-4">No listings found</p>
          {selectedShopId && (
            <button
              onClick={() => syncListings(parseInt(selectedShopId))}
              className="px-4 py-2 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#d97706] transition-colors"
            >
              Sync Listings from Etsy
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-[#111827] p-6 rounded-lg border border-[#374151]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-serif text-[#f5e0c3] mb-2">
                    {listing.title}
                  </h3>
                  <div className="space-y-1 text-sm text-[#c58b5b]">
                    <div>Etsy Listing ID: {listing.etsyListingId}</div>
                    <div>Shop: {listing.shop.name}</div>
                    <div>
                      Current Product Code:{' '}
                      <span
                        className={
                          listing.productCode === 'unknown'
                            ? 'text-red-400'
                            : 'text-[#f59e0b]'
                        }
                      >
                        {listing.productCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Выбор product code */}
              <div>
                <label className="block text-sm font-medium text-[#f5e0c3] mb-2">
                  Map to Product Code:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(groupedByCategory).map(([category, codes]) => (
                    <div key={category} className="space-y-2">
                      <div className="text-xs font-semibold text-[#c58b5b] uppercase">
                        {category}
                      </div>
                      <select
                        value={listing.productCode}
                        onChange={(e) =>
                          updateProductCode(
                            listing.id,
                            e.target.value as ProductCode
                          )
                        }
                        disabled={updating === listing.id}
                        className="w-full px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-[#f9fafb] text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b] disabled:opacity-50"
                      >
                        <option value="unknown">-- Not Mapped --</option>
                        {codes.map((code) => (
                          <option key={code} value={code}>
                            {PRODUCTS[code].title}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                {updating === listing.id && (
                  <div className="mt-2 text-sm text-[#c58b5b]">
                    Updating...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

