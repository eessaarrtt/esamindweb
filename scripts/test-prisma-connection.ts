import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Testing Prisma connection...\n')

  try {
    // 1. Проверка подключения
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // 2. Получение всех промптов
    console.log('2. Fetching all prompts...')
    const allPrompts = await prisma.prompt.findMany({
      take: 5, // Берем первые 5 для примера
    })
    console.log(`✅ Found ${allPrompts.length} prompts (showing first 5):`)
    allPrompts.forEach((p) => {
      console.log(`   - ID: ${p.id}, Code: ${p.productCode}, Category: ${p.category}`)
    })
    console.log()

    // 3. Получение одного промпта по ID
    if (allPrompts.length > 0) {
      const firstPromptId = allPrompts[0].id
      console.log(`3. Fetching prompt by ID (${firstPromptId})...`)
      const prompt = await prisma.prompt.findUnique({
        where: { id: firstPromptId },
      })
      if (prompt) {
        console.log('✅ Prompt found:')
        console.log(`   - ID: ${prompt.id}`)
        console.log(`   - Product Code: ${prompt.productCode}`)
        console.log(`   - Category: ${prompt.category}`)
        console.log(`   - Is Custom: ${prompt.isCustom}`)
        console.log(`   - Template length: ${prompt.template.length} chars`)
        console.log(`   - Template preview: ${prompt.template.substring(0, 100)}...`)
      } else {
        console.log('❌ Prompt not found')
      }
      console.log()
    }

    // 4. Подсчет промптов по категориям
    console.log('4. Counting prompts by category...')
    const categories = await prisma.prompt.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    })
    console.log('✅ Prompts by category:')
    categories.forEach((cat) => {
      console.log(`   - ${cat.category}: ${cat._count.id}`)
    })
    console.log()

    // 5. Проверка структуры данных
    console.log('5. Checking data structure...')
    const sample = await prisma.prompt.findFirst()
    if (sample) {
      console.log('✅ Sample prompt structure:')
      console.log('   Fields:', Object.keys(sample))
      console.log('   Types:', {
        id: typeof sample.id,
        productCode: typeof sample.productCode,
        template: typeof sample.template,
        category: typeof sample.category,
        isCustom: typeof sample.isCustom,
      })
    }
    console.log()

    console.log('✨ All tests passed!')
  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('   Message:', error.message)
      console.error('   Stack:', error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Disconnected from database')
  }
}

testConnection()

