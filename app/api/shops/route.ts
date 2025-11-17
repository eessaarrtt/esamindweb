import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/shops - получить все магазины
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized shops fetch attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const shops = await prisma.etsyShop.findMany({
      select: {
        id: true,
        name: true,
        etsyShopId: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ shops })
  } catch (error) {
    logger.error('Get shops error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

