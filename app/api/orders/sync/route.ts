import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { syncOrdersForAllShops } from '@/lib/orders'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized sync attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { shopId } = await request.json().catch(() => ({}))
    
    logger.info('Orders sync started', { shopId: shopId || 'all shops' })
    
    const result = await syncOrdersForAllShops(shopId ? parseInt(shopId) : undefined)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error('Sync error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

