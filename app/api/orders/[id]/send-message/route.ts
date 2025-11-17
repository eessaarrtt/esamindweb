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
    logger.warn('Unauthorized send-message attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const orderId = parseInt(id)

    logger.info('Sending message to buyer', { orderId })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shop: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.readingText) {
      return NextResponse.json(
        { error: 'Reading not generated yet' },
        { status: 400 }
      )
    }

    if (!order.buyerUserId || !order.shop.etsyShopId) {
      return NextResponse.json(
        { error: 'Missing buyerUserId or shopId' },
        { status: 400 }
      )
    }

    const etsyClient = new EtsyClient(order.shop.accessToken)
    const result = await etsyClient.sendMessageToBuyer(
      order.shop.etsyShopId,
      order.buyerUserId,
      order.readingText
    )

    // Обновляем статус на SENT после успешной отправки
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SENT' },
    })

    logger.info('Message sent successfully', {
      orderId,
      messageId: result.message_id,
      conversationId: result.conversation_id,
    })

    return NextResponse.json({
      success: true,
      messageId: result.message_id,
      conversationId: result.conversation_id,
    })
  } catch (error) {
    logger.error('Send message error', {
      error: error instanceof Error ? error.message : String(error),
    })

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes('Etsy API error')) {
        return NextResponse.json(
          { error: `Etsy API error: ${error.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

