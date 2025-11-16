import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ShopsPage() {
  const shops = await prisma.etsyShop.findMany({
    include: {
      listings: true,
      orders: true,
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif text-[#f5e0c3]">Etsy Shops</h1>
        <a
          href="/api/oauth/etsy/authorize"
          className="px-6 py-3 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#fbbf24] transition-colors font-medium"
        >
          Add New Shop
        </a>
      </div>

      <div className="grid gap-4">
        {shops.map((shop) => (
          <div key={shop.id} className="bg-[#111827] p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-serif text-[#f5e0c3] mb-2">
                  {shop.name}
                </h2>
                <div className="space-y-1 text-[#c58b5b]">
                  <div>Etsy Shop ID: {shop.etsyShopId}</div>
                  <div>Listings Mapped: {shop.listings.length}</div>
                  <div>Total Orders: {shop.orders.length}</div>
                  <div>
                    Connected: {new Date(shop.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {shops.length === 0 && (
          <div className="bg-[#111827] p-12 rounded-lg text-center">
            <p className="text-[#c58b5b] mb-4">No shops connected yet</p>
            <a
              href="/api/oauth/etsy/authorize"
              className="inline-block px-6 py-3 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#fbbf24] transition-colors font-medium"
            >
              Connect Your First Shop
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

