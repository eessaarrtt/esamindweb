import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

// GET /api/stats - получить статистику
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized stats request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // 'all', '7d', '30d', '90d'

    // Вычисляем дату начала периода
    let startDate: Date | undefined
    if (period === '7d') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === '30d') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
    } else if (period === '90d') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)
    }

    const whereClause = startDate ? { createdAt: { gte: startDate } } : {}

    // Статистика по заказам
    const [
      totalOrders,
      pendingOrders,
      generatedOrders,
      sentOrders,
      errorOrders,
      ordersByStatus,
      ordersByShop,
      ordersByProduct,
      ordersByDay,
      totalShops,
      totalPrompts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.order.count({ where: { ...whereClause, status: 'GENERATED' } }),
      prisma.order.count({ where: { ...whereClause, status: 'SENT' } }),
      prisma.order.count({ where: { ...whereClause, status: 'ERROR' } }),
      prisma.order.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ['shopId'],
        where: whereClause,
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ['productCode'],
        where: whereClause,
        _count: { id: true },
      }),
      // Заказы по дням (последние 30 дней)
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*)::int as count
        FROM "Order"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `,
      prisma.etsyShop.count(),
      prisma.prompt.count(),
      prisma.order.findMany({
        where: whereClause,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { shop: true },
      }),
    ])

    // Получаем названия магазинов для ordersByShop
    const shopIds = ordersByShop.map((o) => o.shopId)
    const shops = await prisma.etsyShop.findMany({
      where: { id: { in: shopIds } },
      select: { id: true, name: true },
    })
    const shopMap = new Map(shops.map((s) => [s.id, s.name]))

    // Получаем реальные данные об использовании OpenAI из базы
    // Учитываем и GENERATED, и SENT заказы (оба имеют сгенерированные чтения)
    const generatedOrdersWithUsage = await prisma.order.findMany({
      where: {
        ...whereClause,
        status: { in: ['GENERATED', 'SENT'] },
        openaiTotalTokens: { not: null },
      },
      select: {
        openaiInputTokens: true,
        openaiOutputTokens: true,
        openaiTotalTokens: true,
        openaiCost: true,
        openaiModel: true,
      },
    })

    // Суммируем реальные данные
    let totalInputTokens = 0
    let totalOutputTokens = 0
    let totalTokens = 0
    let totalCost = 0

    for (const order of generatedOrdersWithUsage) {
      if (order.openaiInputTokens) totalInputTokens += order.openaiInputTokens
      if (order.openaiOutputTokens) totalOutputTokens += order.openaiOutputTokens
      if (order.openaiTotalTokens) totalTokens += order.openaiTotalTokens
      if (order.openaiCost) totalCost += Number(order.openaiCost)
    }

    // Для заказов без сохраненных данных используем оценку
    // Учитываем и GENERATED, и SENT заказы
    const ordersWithoutUsage = await prisma.order.count({
      where: {
        ...whereClause,
        status: { in: ['GENERATED', 'SENT'] },
        readingText: { not: null },
        openaiTotalTokens: null,
      },
    })

    // Примерная оценка для заказов без данных (1 токен ≈ 4 символа)
    let estimatedInputTokens = 0
    let estimatedOutputTokens = 0

    if (ordersWithoutUsage > 0) {
      const ordersForEstimate = await prisma.order.findMany({
        where: {
          ...whereClause,
          status: { in: ['GENERATED', 'SENT'] },
          readingText: { not: null },
          openaiTotalTokens: null,
        },
        select: { readingText: true },
        take: 10, // Берем выборку для оценки
      })

      for (const order of ordersForEstimate) {
        estimatedInputTokens += 500 // Средний промпт
        if (order.readingText) {
          estimatedOutputTokens += Math.ceil(order.readingText.length / 4)
        }
      }

      // Экстраполируем на все заказы без данных
      if (ordersForEstimate.length > 0) {
        const avgInput = estimatedInputTokens / ordersForEstimate.length
        const avgOutput = estimatedOutputTokens / ordersForEstimate.length
        estimatedInputTokens = Math.round(avgInput * ordersWithoutUsage)
        estimatedOutputTokens = Math.round(avgOutput * ordersWithoutUsage)
      }
    }

    // Расчет стоимости для оцененных заказов (gpt-4o цены)
    const estimatedInputCost = (estimatedInputTokens / 1_000_000) * 2.5
    const estimatedOutputCost = (estimatedOutputTokens / 1_000_000) * 10.0
    const estimatedCost = estimatedInputCost + estimatedOutputCost

    // Итоговые значения
    const finalInputTokens = totalInputTokens + estimatedInputTokens
    const finalOutputTokens = totalOutputTokens + estimatedOutputTokens
    const finalTotalTokens = totalTokens + estimatedInputTokens + estimatedOutputTokens
    const finalTotalCost = totalCost + estimatedCost

    // Статистика по промптам
    const promptsByCategory = await prisma.prompt.groupBy({
      by: ['category'],
      _count: { id: true },
    })

    const stats = {
      period,
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        generated: generatedOrders,
        sent: sentOrders,
        error: errorOrders,
        byStatus: ordersByStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        byShop: ordersByShop.map((o) => ({
          shopId: o.shopId,
          shopName: shopMap.get(o.shopId) || 'Unknown',
          count: o._count.id,
        })),
        byProduct: ordersByProduct
          .map((p) => ({
            productCode: p.productCode,
            count: p._count.id,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10), // Топ 10 продуктов
        byDay: ordersByDay.map((d) => ({
          date: d.date instanceof Date ? d.date.toISOString().split('T')[0] : String(d.date),
          count: Number(d.count),
        })),
      },
      shops: {
        total: totalShops,
      },
      prompts: {
        total: totalPrompts,
        byCategory: promptsByCategory.map((p) => ({
          category: p.category,
          count: p._count.id,
        })),
      },
      openai: {
        inputTokens: finalInputTokens,
        outputTokens: finalOutputTokens,
        totalTokens: finalTotalTokens,
        cost: {
          total: finalTotalCost,
          fromSavedData: totalCost,
          estimated: estimatedCost,
        },
        generatedReadings: generatedOrders + sentOrders, // Все заказы с сгенерированными чтениями
        withSavedData: generatedOrdersWithUsage.length,
        withoutSavedData: ordersWithoutUsage,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        productCode: o.productCode,
        shopName: o.shop.name,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
    }

    logger.info('Stats retrieved', { period, totalOrders })
    return NextResponse.json({ stats })
  } catch (error) {
    logger.error('Get stats error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

