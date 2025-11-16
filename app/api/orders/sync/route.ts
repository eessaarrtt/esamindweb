import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EtsyClient } from '@/lib/etsy'
import { parsePersonalization } from '@/lib/parsing'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { shopId } = await request.json().catch(() => ({}))
    
    const shops = shopId
      ? await prisma.etsyShop.findMany({ where: { id: parseInt(shopId) } })
      : await prisma.etsyShop.findMany()

    let newOrders = 0
    let skipped = 0
    let errors = 0

    for (const shop of shops) {
      try {
        const client = new EtsyClient(shop.accessToken)
        const receipts = await client.getReceipts(shop.etsyShopId)

        for (const receipt of receipts) {
          try {
            const transactions = await client.getReceiptTransactions(receipt.receipt_id)

            for (const transaction of transactions) {
              // Check if order already exists
              const existing = await prisma.order.findUnique({
                where: { etsyReceiptId: String(receipt.receipt_id) },
              })

              if (existing) {
                skipped++
                continue
              }

              // Find listing mapping
              const listing = await prisma.etsyListing.findFirst({
                where: { etsyListingId: String(transaction.listing_id) },
              })

              const productCode = listing?.productCode || 'unknown'

              // Parse personalization
              const parsed = parsePersonalization(transaction.personalization)

              // Create order
              await prisma.order.create({
                data: {
                  etsyReceiptId: String(receipt.receipt_id),
                  etsyTransactionId: String(transaction.transaction_id),
                  buyerName: receipt.buyer_name,
                  buyerUserId: String(receipt.buyer_user_id),
                  personalization: transaction.personalization,
                  name: parsed.name,
                  age: parsed.age,
                  question: parsed.question,
                  productCode,
                  shopId: shop.id,
                  status: 'PENDING',
                },
              })

              newOrders++
            }
          } catch (error) {
            console.error(`Error processing receipt ${receipt.receipt_id}:`, error)
            errors++
          }
        }
      } catch (error) {
        console.error(`Error syncing shop ${shop.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      newOrders,
      skipped,
      errors,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

