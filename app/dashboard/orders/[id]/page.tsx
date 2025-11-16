import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { OrderActions } from '@/components/dashboard/OrderActions'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(params.id) },
    include: { shop: true },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif text-[#f5e0c3] mb-2">
          Order #{order.id}
        </h1>
        <div className="text-[#c58b5b]">
          {order.shop.name} • {new Date(order.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-[#111827] p-6 rounded-lg">
          <h2 className="text-2xl font-serif text-[#f5e0c3] mb-4">Order Details</h2>
          <div className="space-y-3 text-[#f9fafb]">
            <div>
              <span className="text-[#c58b5b]">Status:</span>{' '}
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
            </div>
            <div>
              <span className="text-[#c58b5b]">Product Code:</span> {order.productCode}
            </div>
            <div>
              <span className="text-[#c58b5b]">Etsy Receipt ID:</span> {order.etsyReceiptId}
            </div>
            <div>
              <span className="text-[#c58b5b]">Buyer Name:</span> {order.buyerName || 'N/A'}
            </div>
            <div>
              <span className="text-[#c58b5b]">Buyer User ID:</span> {order.buyerUserId || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-[#111827] p-6 rounded-lg">
          <h2 className="text-2xl font-serif text-[#f5e0c3] mb-4">Personalization</h2>
          <div className="space-y-3 text-[#f9fafb]">
            <div>
              <span className="text-[#c58b5b]">Name:</span> {order.name || 'Not provided'}
            </div>
            <div>
              <span className="text-[#c58b5b]">Age:</span> {order.age || 'Not provided'}
            </div>
            <div>
              <span className="text-[#c58b5b]">Question:</span> {order.question || 'Not provided'}
            </div>
            <div className="mt-4">
              <span className="text-[#c58b5b] block mb-2">Raw Personalization:</span>
              <div className="bg-[#050409] p-4 rounded border border-[#374151] whitespace-pre-wrap">
                {order.personalization || 'No personalization provided'}
              </div>
            </div>
          </div>
        </div>

        {order.readingText && (
          <div className="bg-[#111827] p-6 rounded-lg">
            <h2 className="text-2xl font-serif text-[#f5e0c3] mb-4">Generated Reading</h2>
            <div className="bg-[#050409] p-4 rounded border border-[#374151] whitespace-pre-wrap text-[#f9fafb]">
              {order.readingText}
            </div>
          </div>
        )}

        <OrderActions order={order} />
      </div>
    </div>
  )
}

