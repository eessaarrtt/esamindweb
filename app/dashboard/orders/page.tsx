import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SyncButton } from '@/components/dashboard/SyncButton'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; shopId?: string }
}) {
  const where: any = {}
  if (searchParams.status) {
    where.status = searchParams.status
  }
  if (searchParams.shopId) {
    where.shopId = parseInt(searchParams.shopId)
  }

  const [orders, shops] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { shop: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.etsyShop.findMany(),
  ])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif text-[#f5e0c3]">Orders</h1>
        <SyncButton />
      </div>

      <div className="bg-[#111827] p-4 rounded-lg flex gap-4">
        <a
          href="/dashboard/orders"
          className={`px-4 py-2 rounded ${
            !searchParams.status
              ? 'bg-[#f59e0b] text-[#050409]'
              : 'bg-[#1f2937] text-[#f9fafb] hover:bg-[#374151]'
          }`}
        >
          All
        </a>
        <a
          href="/dashboard/orders?status=PENDING"
          className={`px-4 py-2 rounded ${
            searchParams.status === 'PENDING'
              ? 'bg-[#f59e0b] text-[#050409]'
              : 'bg-[#1f2937] text-[#f9fafb] hover:bg-[#374151]'
          }`}
        >
          Pending
        </a>
        <a
          href="/dashboard/orders?status=GENERATED"
          className={`px-4 py-2 rounded ${
            searchParams.status === 'GENERATED'
              ? 'bg-[#f59e0b] text-[#050409]'
              : 'bg-[#1f2937] text-[#f9fafb] hover:bg-[#374151]'
          }`}
        >
          Generated
        </a>
        <a
          href="/dashboard/orders?status=SENT"
          className={`px-4 py-2 rounded ${
            searchParams.status === 'SENT'
              ? 'bg-[#f59e0b] text-[#050409]'
              : 'bg-[#1f2937] text-[#f9fafb] hover:bg-[#374151]'
          }`}
        >
          Sent
        </a>
      </div>

      <div className="bg-[#111827] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#374151]">
              <th className="text-left py-3 px-4 text-[#c58b5b]">Date</th>
              <th className="text-left py-3 px-4 text-[#c58b5b]">Shop</th>
              <th className="text-left py-3 px-4 text-[#c58b5b]">Product</th>
              <th className="text-left py-3 px-4 text-[#c58b5b]">Buyer</th>
              <th className="text-left py-3 px-4 text-[#c58b5b]">Status</th>
              <th className="text-left py-3 px-4 text-[#c58b5b]">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#374151]">
                <td className="py-3 px-4 text-[#f9fafb]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-[#f9fafb]">{order.shop.name}</td>
                <td className="py-3 px-4 text-[#f9fafb]">{order.productCode}</td>
                <td className="py-3 px-4 text-[#f9fafb]">{order.buyerName || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      order.status === 'PENDING'
                        ? 'bg-yellow-900 text-yellow-300'
                        : order.status === 'GENERATED'
                        ? 'bg-green-900 text-green-300'
                        : order.status === 'SENT'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-[#f59e0b] hover:text-[#fbbf24]"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-8 text-[#c58b5b]">No orders found</div>
        )}
      </div>
    </div>
  )
}

