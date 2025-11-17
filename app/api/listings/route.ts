import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/listings - получить все листинги (с фильтрацией по shopId)
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized listings fetch attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    const where = shopId ? { shopId: parseInt(shopId) } : {}

    const listings = await prisma.etsyListing.findMany({
      where,
      include: { shop: true },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    logger.error('Get listings error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

