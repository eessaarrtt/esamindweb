import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { PRODUCTS, type ProductCode } from '@/lib/products'

export const runtime = 'nodejs'

// GET /api/prompts/[id] - получить промпт по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized prompt get attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const promptId = parseInt(id)

    if (isNaN(promptId)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 })
    }

    logger.debug('Fetching prompt from database', { promptId })
    
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    })

    logger.debug('Prompt query result', { 
      promptId, 
      found: !!prompt,
      productCode: prompt?.productCode,
      templateLength: prompt?.template?.length 
    })

    if (!prompt) {
      logger.warn('Prompt not found', { promptId })
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    logger.info('Prompt retrieved successfully', { 
      id: prompt.id, 
      productCode: prompt.productCode 
    })
    
    return NextResponse.json({ prompt })
  } catch (error) {
    logger.error('Get prompt error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/prompts/[id] - обновить промпт
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized prompt update attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const promptId = parseInt(id)

    if (isNaN(promptId)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 })
    }

    const body = await request.json()
    const { template, category, isCustom } = body

    // Проверяем существование промпта
    const existing = await prisma.prompt.findUnique({
      where: { id: promptId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Обновляем только переданные поля
    const updateData: {
      template?: string
      category?: string
      isCustom?: boolean
    } = {}

    if (template !== undefined) updateData.template = template
    if (category !== undefined) updateData.category = category
    if (isCustom !== undefined) updateData.isCustom = isCustom

    const prompt = await prisma.prompt.update({
      where: { id: promptId },
      data: updateData,
    })

    logger.info('Prompt updated', { id: promptId, productCode: prompt.productCode })
    return NextResponse.json({ prompt })
  } catch (error) {
    logger.error('Update prompt error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/prompts/[id] - удалить промпт
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized prompt delete attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const promptId = parseInt(id)

    if (isNaN(promptId)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 })
    }

    const existing = await prisma.prompt.findUnique({
      where: { id: promptId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    await prisma.prompt.delete({
      where: { id: promptId },
    })

    logger.info('Prompt deleted', { id: promptId, productCode: existing.productCode })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete prompt error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

