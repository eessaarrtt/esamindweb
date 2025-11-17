import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PRODUCTS, type ProductCode } from '../lib/products'
import { generateReadingForOrder } from '../lib/orders'

const prisma = new PrismaClient()

async function createTestOrder() {
  console.log('🧪 Creating test order...\n')

  try {
    // Проверяем наличие магазина, создаем тестовый если нет
    let shops = await prisma.etsyShop.findMany()
    let shop

    if (shops.length === 0) {
      console.log('⚠️  No shops found. Creating test shop...\n')
      shop = await prisma.etsyShop.create({
        data: {
          name: 'Test Etsy Shop',
          etsyShopId: 'test_shop_123',
          accessToken: 'test_access_token',
          refreshToken: 'test_refresh_token',
        },
      })
      console.log(`✅ Test shop created: ${shop.name} (ID: ${shop.id})\n`)
    } else {
      shop = shops[0]
      console.log(`✅ Using shop: ${shop.name} (ID: ${shop.id})\n`)
    }

    // Получаем первый доступный productCode
    const productCodes = Object.keys(PRODUCTS) as ProductCode[]
    const productCode = productCodes[0]
    const product = PRODUCTS[productCode]

    console.log(`📦 Product: ${product.title}`)
    console.log(`   Code: ${productCode}`)
    console.log(`   Category: ${product.category}\n`)

    // Тестовые данные заказа
    const testOrderData = {
      etsyReceiptId: `TEST-${Date.now()}`,
      etsyTransactionId: `TEST-TXN-${Date.now()}`,
      buyerName: 'Test Customer',
      buyerUserId: 'test_user_123',
      personalization: 'My name is Sarah, I am 28 years old. I want to know about my career path and what opportunities are coming my way.',
      name: 'Sarah',
      age: '28',
      question: 'career path and opportunities',
      productCode: productCode,
      shopId: shop.id,
      status: 'PENDING' as const,
    }

    console.log('📝 Order data:')
    console.log(`   Buyer: ${testOrderData.buyerName}`)
    console.log(`   Name: ${testOrderData.name}`)
    console.log(`   Age: ${testOrderData.age}`)
    console.log(`   Question: ${testOrderData.question}`)
    console.log(`   Personalization: ${testOrderData.personalization.substring(0, 60)}...\n`)

    // Проверяем, не существует ли уже заказ с таким receiptId
    const existing = await prisma.order.findUnique({
      where: { etsyReceiptId: testOrderData.etsyReceiptId },
    })

    if (existing) {
      console.log('⚠️  Order with this receiptId already exists')
      console.log(`   Order ID: ${existing.id}`)
      console.log(`   Status: ${existing.status}`)
      console.log('\n✅ Test order already exists!')
      await prisma.$disconnect()
      return
    }

    // Создаем заказ
    const order = await prisma.order.create({
      data: testOrderData,
    })

    console.log('✅ Test order created successfully!')
    console.log(`\n📋 Order Details:`)
    console.log(`   ID: ${order.id}`)
    console.log(`   Receipt ID: ${order.etsyReceiptId}`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Product: ${order.productCode}`)
    console.log(`   Shop: ${shop.name}`)
    console.log(`   Created: ${order.createdAt.toISOString()}`)

    // Автоматически генерируем чтение
    if (productCode && productCode !== 'unknown' as any) {
      console.log(`\n🤖 Auto-generating reading...`)
      try {
        const readingText = await generateReadingForOrder(order.id)
        console.log(`✅ Reading generated successfully!`)
        console.log(`   Length: ${readingText.length} characters`)
        console.log(`   Preview: ${readingText.substring(0, 100)}...`)
      } catch (error) {
        console.error(`❌ Failed to generate reading:`)
        console.error(`   ${error instanceof Error ? error.message : String(error)}`)
        console.log(`\n💡 You can try generating manually in the dashboard`)
      }
    }

    console.log(`\n🔗 View order in dashboard:`)
    console.log(`   http://localhost:3000/dashboard/orders/${order.id}`)

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error creating test order:', error)
    if (error instanceof Error) {
      console.error('   Message:', error.message)
      console.error('   Stack:', error.stack)
    }
    await prisma.$disconnect()
    process.exit(1)
  }
}

createTestOrder()

