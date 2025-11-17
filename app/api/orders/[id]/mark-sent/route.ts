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
    logger.warn('Unauthorized mark-sent attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let orderId: number | undefined
  try {
    const { id } = await params
    orderId = parseInt(id)

    logger.info('Marking order as sent', { orderId })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shop: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Если есть чтение и данные покупателя, пытаемся отправить сообщение
    if (order.readingText && order.buyerUserId && order.shop.etsyShopId) {
      try {
        logger.info('Auto-sending reading when marking as sent', { orderId })
        const etsyClient = new EtsyClient(order.shop.accessToken)
        await etsyClient.sendMessageToBuyer(
          order.shop.etsyShopId,
          order.buyerUserId,
          order.readingText
        )
        logger.info('Reading sent successfully when marking as sent', { orderId })
      } catch (error) {
        // Если отправка не удалась, просто логируем, но все равно помечаем как SENT
        logger.warn('Failed to send reading when marking as sent, but continuing', {
          orderId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Обновляем статус на SENT
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SENT' },
    })

    logger.info('Order marked as sent', { orderId })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Mark sent error', {
      orderId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

