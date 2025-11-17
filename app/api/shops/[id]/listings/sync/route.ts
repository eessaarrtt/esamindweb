import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EtsyClient } from '@/lib/etsy'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized listings sync attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const shopId = parseInt(id)

    const shop = await prisma.etsyShop.findUnique({
      where: { id: shopId },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    logger.info('Syncing listings from Etsy', { shopId: shop.id, shopName: shop.name })

    const client = new EtsyClient(shop.accessToken)
    const listings = await client.getShopListings(shop.etsyShopId)

    let created = 0
    let updated = 0
    let skipped = 0

    for (const listing of listings) {
      try {
        const existing = await prisma.etsyListing.findUnique({
          where: { etsyListingId: String(listing.listing_id) },
        })

        if (existing) {
          // Обновляем title, если изменился
          if (existing.title !== listing.title) {
            await prisma.etsyListing.update({
              where: { id: existing.id },
              data: { title: listing.title },
            })
            updated++
            logger.debug('Listing updated', { listingId: listing.listing_id, title: listing.title })
          } else {
            skipped++
          }
        } else {
          // Создаем новый листинг без productCode (нужно будет настроить вручную)
          await prisma.etsyListing.create({
            data: {
              etsyListingId: String(listing.listing_id),
              title: listing.title,
              productCode: 'unknown', // По умолчанию unknown, нужно настроить вручную
              shopId: shop.id,
            },
          })
          created++
          logger.debug('Listing created', { listingId: listing.listing_id, title: listing.title })
        }
      } catch (error) {
        logger.error('Error processing listing', {
          listingId: listing.listing_id,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    logger.info('Listings sync completed', { shopId, created, updated, skipped })

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped,
      total: listings.length,
    })
  } catch (error) {
    logger.error('Sync listings error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

