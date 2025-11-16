import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReading } from '@/lib/openai'
import { PRODUCT_PROMPTS } from '@/lib/prompts/products'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { shop: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const promptBuilder = PRODUCT_PROMPTS[order.productCode]
    if (!promptBuilder) {
      return NextResponse.json(
        { error: `No prompt builder for product code: ${order.productCode}` },
        { status: 400 }
      )
    }

    const prompt = promptBuilder({
      name: order.name,
      age: order.age,
      question: order.question,
      rawPersonalization: order.personalization || undefined,
    })

    const readingText = await generateReading(prompt)

    await prisma.order.update({
      where: { id: order.id },
      data: {
        readingText,
        status: 'GENERATED',
      },
    })

    return NextResponse.json({ success: true, readingText })
  } catch (error) {
    console.error('Generate reading error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

