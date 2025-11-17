import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export default async function DashboardPage() {
  try {
    const [shops, orders, pendingOrders, generatedOrders, sentOrders] = await Promise.all([
      prisma.etsyShop.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'GENERATED' } }),
      prisma.order.count({ where: { status: 'SENT' } }),
    ])

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { shop: true },
    })

    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-serif text-[#f5e0c3]">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#111827] p-6 rounded-lg">
            <div className="text-[#c58b5b] text-sm mb-2">Connected Shops</div>
            <div className="text-3xl font-bold text-[#f9fafb]">{shops}</div>
          </div>
          <div className="bg-[#111827] p-6 rounded-lg">
            <div className="text-[#c58b5b] text-sm mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-[#f9fafb]">{orders}</div>
          </div>
          <div className="bg-[#111827] p-6 rounded-lg">
            <div className="text-[#c58b5b] text-sm mb-2">Pending</div>
            <div className="text-3xl font-bold text-[#f59e0b]">{pendingOrders}</div>
          </div>
          <div className="bg-[#111827] p-6 rounded-lg">
            <div className="text-[#c58b5b] text-sm mb-2">Generated</div>
            <div className="text-3xl font-bold text-[#fbbf24]">{generatedOrders}</div>
          </div>
        </div>

        <div className="bg-[#111827] rounded-lg p-6">
          <h2 className="text-2xl font-serif text-[#f5e0c3] mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
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
                {recentOrders.map((order) => (
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
            {recentOrders.length === 0 && (
              <div className="text-center py-8 text-[#c58b5b]">No orders yet</div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    logger.error('Dashboard page error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-serif text-[#f5e0c3]">Dashboard Overview</h1>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <h2 className="text-2xl font-serif text-red-400 mb-2">Database Error</h2>
          <p className="text-red-300">
            Unable to connect to the database. Please check your DATABASE_URL configuration.
          </p>
          <p className="text-red-400 text-sm mt-2">
            Error: {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    )
  }
}

