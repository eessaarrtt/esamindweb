import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { PRODUCTS, type ProductCode } from '@/lib/products'

export const runtime = 'nodejs'

// GET /api/prompts - получить все промпты
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized prompts list attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    logger.debug('Fetching prompts from database')
    logger.debug('Prisma client available:', !!prisma)
    logger.debug('Prompt model available:', typeof prisma.prompt !== 'undefined')
    
    if (typeof prisma.prompt === 'undefined') {
      logger.error('Prompt model is not available in Prisma Client')
      return NextResponse.json(
        { error: 'Database model not available. Please regenerate Prisma Client.' },
        { status: 500 }
      )
    }

    const prompts = await prisma.prompt.findMany({
      orderBy: { productCode: 'asc' },
    })

    logger.info('Prompts retrieved successfully', { count: prompts.length })
    return NextResponse.json({ prompts })
  } catch (error) {
    logger.error('Get prompts error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/prompts - создать новый промпт
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized prompt create attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productCode, template, category, isCustom } = body

    if (!productCode || !template || !category) {
      return NextResponse.json(
        { error: 'productCode, template, and category are required' },
        { status: 400 }
      )
    }

    // Валидация: productCode должен быть непустой строкой
    if (typeof productCode !== 'string' || productCode.trim().length === 0) {
      return NextResponse.json(
        { error: 'productCode must be a non-empty string' },
        { status: 400 }
      )
    }

    // Валидация: category должен быть непустой строкой
    if (typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        { error: 'category must be a non-empty string' },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже промпт для этого productCode
    const existing = await prisma.prompt.findUnique({
      where: { productCode },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Prompt for this productCode already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    const prompt = await prisma.prompt.create({
      data: {
        productCode,
        template,
        category,
        isCustom: isCustom ?? true,
      },
    })

    logger.info('Prompt created', { productCode, id: prompt.id })
    return NextResponse.json({ prompt })
  } catch (error) {
    logger.error('Create prompt error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

