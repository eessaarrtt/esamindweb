import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/listings/[id] - получить листинг
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized listing fetch attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const listingId = parseInt(id)

    const listing = await prisma.etsyListing.findUnique({
      where: { id: listingId },
      include: { shop: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    logger.error('Get listing error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/listings/[id] - обновить маппинг productCode
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized listing update attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const listingId = parseInt(id)

    const body = await request.json()
    const { productCode } = body

    if (!productCode || typeof productCode !== 'string') {
      return NextResponse.json(
        { error: 'productCode is required and must be a string' },
        { status: 400 }
      )
    }

    const listing = await prisma.etsyListing.update({
      where: { id: listingId },
      data: { productCode },
    })

    logger.info('Listing productCode updated', {
      listingId: listing.id,
      etsyListingId: listing.etsyListingId,
      productCode: listing.productCode,
    })

    return NextResponse.json({ listing })
  } catch (error) {
    logger.error('Update listing error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

