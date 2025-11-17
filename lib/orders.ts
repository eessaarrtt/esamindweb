import { prisma } from './prisma'
import { EtsyClient, exchangeEtsyCode } from './etsy'
import { parsePersonalization } from './parsing'
import { generateReading } from './openai'
import { PRODUCT_PROMPTS } from './prompts/products'
import { generatePromptTemplate } from './prompts/generator'
import type { ReadingInput } from './prompts/types'
import type { ProductCode } from './products'
import { logger } from './logger'

/**
 * Рендерит шаблон промпта с реальными значениями из ReadingInput
 */
function renderPromptTemplate(template: string, input: ReadingInput): string {
  return template
    .replace(/\$\{input\.name \?\? 'not provided'\}/g, input.name ?? 'not provided')
    .replace(/\$\{input\.age \?\? 'not provided'\}/g, input.age ?? 'not provided')
    .replace(/\$\{input\.question \?\? 'not clearly stated'\}/g, input.question ?? 'not clearly stated')
    .replace(/\$\{input\.rawPersonalization \?\? ''\}/g, input.rawPersonalization ?? '')
}

export interface SyncResult {
  newOrders: number
  skipped: number
  errors: number
}

/**
 * Синхронизирует заказы для одного магазина
 */
export async function syncOrdersForShop(shopId: number): Promise<SyncResult> {
  const shop = await prisma.etsyShop.findUnique({
    where: { id: shopId },
  })

  if (!shop) {
    throw new Error(`Shop ${shopId} not found`)
  }

  logger.debug('Syncing shop', { shopId: shop.id, shopName: shop.name })
  
  const client = new EtsyClient(shop.accessToken)
  const receipts = await client.getReceipts(shop.etsyShopId)

  logger.debug('Receipts fetched', { shopId: shop.id, receiptsCount: receipts.length })

  let newOrders = 0
  let skipped = 0
  let errors = 0

  for (const receipt of receipts) {
    try {
      const transactions = await client.getReceiptTransactions(receipt.receipt_id)

      for (const transaction of transactions) {
        // Check if order already exists
        const existing = await prisma.order.findUnique({
          where: { etsyReceiptId: String(receipt.receipt_id) },
        })

        if (existing) {
          skipped++
          logger.debug('Order already exists, skipping', { 
            receiptId: receipt.receipt_id,
            orderId: existing.id 
          })
          continue
        }

        // Find listing mapping
        const listing = await prisma.etsyListing.findFirst({
          where: { etsyListingId: String(transaction.listing_id) },
        })

        const productCode = listing?.productCode || 'unknown'

        // Parse personalization
        const parsed = parsePersonalization(transaction.personalization)

        // Create order
        const newOrder = await prisma.order.create({
          data: {
            etsyReceiptId: String(receipt.receipt_id),
            etsyTransactionId: String(transaction.transaction_id),
            buyerName: receipt.buyer_name,
            buyerUserId: String(receipt.buyer_user_id),
            personalization: transaction.personalization,
            name: parsed.name,
            age: parsed.age,
            question: parsed.question,
            productCode,
            shopId: shop.id,
            status: 'PENDING',
          },
        })

        logger.info('New order created', { 
          orderId: newOrder.id,
          receiptId: receipt.receipt_id,
          productCode,
          buyerName: receipt.buyer_name
        })
        newOrders++

        // Автоматически генерируем чтение для нового заказа
        if (productCode !== 'unknown') {
          try {
            logger.info('Auto-generating reading for new order', { orderId: newOrder.id })
            await generateReadingForOrder(newOrder.id)
            logger.info('Reading auto-generated successfully', { orderId: newOrder.id })
          } catch (error) {
            // Если генерация не удалась, оставляем заказ в статусе PENDING
            // Пользователь сможет попробовать сгенерировать вручную позже
            logger.error('Failed to auto-generate reading for new order', {
              orderId: newOrder.id,
              error: error instanceof Error ? error.message : String(error),
            })
            // Обновляем статус на ERROR только если это критическая ошибка
            if (error instanceof Error && error.message.includes('not found')) {
              await prisma.order.update({
                where: { id: newOrder.id },
                data: { status: 'ERROR' },
              })
            }
          }
        } else {
          logger.warn('Skipping auto-generation: productCode is unknown', { orderId: newOrder.id })
        }
      }
    } catch (error) {
      logger.error('Error processing receipt', { 
        receiptId: receipt.receipt_id,
        error: error instanceof Error ? error.message : String(error)
      })
      errors++
    }
  }

  return { newOrders, skipped, errors }
}

/**
 * Синхронизирует заказы для всех магазинов или конкретного магазина
 */
export async function syncOrdersForAllShops(shopId?: number): Promise<SyncResult> {
  const shops = shopId
    ? await prisma.etsyShop.findMany({ where: { id: shopId } })
    : await prisma.etsyShop.findMany()

  logger.info('Shops to sync', { count: shops.length, shopIds: shops.map(s => s.id) })

  let totalNewOrders = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const shop of shops) {
    try {
      const result = await syncOrdersForShop(shop.id)
      totalNewOrders += result.newOrders
      totalSkipped += result.skipped
      totalErrors += result.errors
    } catch (error) {
      logger.error('Error syncing shop', { 
        shopId: shop.id,
        shopName: shop.name,
        error: error instanceof Error ? error.message : String(error)
      })
      totalErrors++
    }
  }

  logger.info('Orders sync completed', { 
    newOrders: totalNewOrders, 
    skipped: totalSkipped, 
    errors: totalErrors 
  })

  return {
    newOrders: totalNewOrders,
    skipped: totalSkipped,
    errors: totalErrors,
  }
}

/**
 * Генерирует чтение для заказа
 */
export async function generateReadingForOrder(orderId: number): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shop: true },
  })

  if (!order) {
    throw new Error(`Order ${orderId} not found`)
  }

  logger.debug('Order found', { 
    orderId: order.id, 
    productCode: order.productCode, 
    shopId: order.shopId 
  })

  // Type guard: проверяем, что productCode является валидным ProductCode
  const productCode = order.productCode as ProductCode
  const readingInput: ReadingInput = {
    name: order.name || undefined,
    age: order.age || undefined,
    question: order.question || undefined,
    rawPersonalization: order.personalization || undefined,
  }

  // Приоритет: 1) Промпт из БД, 2) Кастомный промпт из файла, 3) Автогенерация
  let prompt: string
  
  // Пытаемся получить промпт из БД
  const dbPrompt = await prisma.prompt.findUnique({
    where: { productCode },
  })

  if (dbPrompt) {
    logger.debug('Using prompt from database', { productCode, isCustom: dbPrompt.isCustom })
    prompt = renderPromptTemplate(dbPrompt.template, readingInput)
  } else {
    // Fallback на старую логику (файлы)
    const promptBuilder = PRODUCT_PROMPTS[productCode]
    
    if (promptBuilder) {
      logger.debug('Using custom prompt builder from file', { productCode })
      prompt = promptBuilder(readingInput)
    } else {
      logger.info('No custom prompt found, generating template automatically', { productCode })
      prompt = generatePromptTemplate(productCode, readingInput)
    }
  }

  logger.info('Generating reading with OpenAI', { orderId, productCode: order.productCode })
  const startTime = Date.now()
  
  const { content: readingText, usage } = await generateReading(prompt)
  
  const duration = Date.now() - startTime
  logger.info('Reading generated successfully', { 
    orderId, 
    duration: `${duration}ms`,
    readingLength: readingText.length,
    tokens: usage.totalTokens,
    cost: usage.cost
  })

  await prisma.order.update({
    where: { id: order.id },
    data: {
      readingText,
      status: 'GENERATED',
      openaiModel: usage.model,
      openaiInputTokens: usage.promptTokens,
      openaiOutputTokens: usage.completionTokens,
      openaiTotalTokens: usage.totalTokens,
      openaiCost: usage.cost,
    },
  })

  logger.info('Order updated to GENERATED', { orderId })

  // Автоматически отправляем сообщение клиенту через Etsy
  if (order.buyerUserId && order.shop.etsyShopId) {
    try {
      logger.info('Auto-sending reading to buyer via Etsy', { 
        orderId, 
        buyerUserId: order.buyerUserId,
        shopId: order.shop.etsyShopId
      })
      
      const etsyClient = new EtsyClient(order.shop.accessToken)
      await etsyClient.sendMessageToBuyer(
        order.shop.etsyShopId,
        order.buyerUserId,
        readingText
      )
      
      // Обновляем статус на SENT после успешной отправки
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'SENT' },
      })
      
      logger.info('Reading sent to buyer and order marked as SENT', { orderId })
    } catch (error) {
      // Если отправка не удалась, оставляем статус GENERATED
      // Администратор сможет отправить вручную позже
      logger.error('Failed to auto-send reading to buyer', {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      })
      // Не пробрасываем ошибку, чтобы не сломать процесс генерации
    }
  } else {
    logger.warn('Cannot auto-send reading: missing buyerUserId or shopId', {
      orderId,
      hasBuyerUserId: !!order.buyerUserId,
      hasShopId: !!order.shop.etsyShopId,
    })
  }

  return readingText
}

