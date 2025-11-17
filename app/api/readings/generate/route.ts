import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { generateReadingForOrder } from '@/lib/orders'
import { logger } from '@/lib/logger'

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized reading generation attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId } = await request.json()

    logger.info('Reading generation requested', { orderId })

    if (!orderId) {
      logger.warn('Reading generation failed: orderId missing')
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }

    const readingText = await generateReadingForOrder(parseInt(orderId))

    return NextResponse.json({ success: true, readingText })
  } catch (error) {
    logger.error('Generate reading error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    if (error instanceof Error) {
      // Ошибки валидации
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      
      if (error.message.includes('No prompt builder')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      // Ошибки OpenAI
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key is invalid or not configured' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'OpenAI rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: 'OpenAI account has insufficient quota. Please check billing.' },
          { status: 402 }
        )
      }
      
      if (error.message.includes('model')) {
        return NextResponse.json(
          { error: `OpenAI model error: ${error.message}` },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

