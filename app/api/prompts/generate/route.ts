import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { generatePromptTemplate } from '@/lib/prompts/generator'
import { PRODUCTS, type ProductCode } from '@/lib/products'
import { logger } from '@/lib/logger'
import type { ReadingInput } from '@/lib/prompts/types'

export const runtime = 'nodejs'

// POST /api/prompts/generate - сгенерировать промпт автоматически
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized prompt generation attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productCode } = body

    if (!productCode) {
      return NextResponse.json(
        { error: 'productCode is required' },
        { status: 400 }
      )
    }

    // Проверяем, что productCode существует
    const product = PRODUCTS[productCode as ProductCode]
    if (!product) {
      return NextResponse.json(
        { error: `Invalid productCode: ${productCode}` },
        { status: 400 }
      )
    }

    // Генерируем промпт с тестовыми значениями для получения шаблона
    const testInput: ReadingInput = {
      name: 'TEST_NAME_PLACEHOLDER',
      age: 'TEST_AGE_PLACEHOLDER',
      question: 'TEST_QUESTION_PLACEHOLDER',
      rawPersonalization: 'TEST_PERSONALIZATION_PLACEHOLDER',
    }

    let template = generatePromptTemplate(productCode as ProductCode, testInput)

    // Заменяем тестовые значения обратно на плейсхолдеры
    template = template.replace(/TEST_NAME_PLACEHOLDER/g, "${input.name ?? 'not provided'}")
    template = template.replace(/TEST_AGE_PLACEHOLDER/g, "${input.age ?? 'not provided'}")
    template = template.replace(/TEST_QUESTION_PLACEHOLDER/g, "${input.question ?? 'not clearly stated'}")
    template = template.replace(/TEST_PERSONALIZATION_PLACEHOLDER/g, "${input.rawPersonalization ?? ''}")

    logger.info('Prompt generated', { productCode })

    return NextResponse.json({
      success: true,
      template,
      category: product.category,
      productCode,
    })
  } catch (error) {
    logger.error('Generate prompt error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

