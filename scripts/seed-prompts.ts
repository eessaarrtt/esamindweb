import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PRODUCT_PROMPTS } from '../lib/prompts/products'
import { PRODUCTS, type ProductCode } from '../lib/products'
import type { ReadingInput } from '../lib/prompts/types'

const prisma = new PrismaClient()

/**
 * Извлекает шаблон промпта из функции, заменяя реальные значения на плейсхолдеры
 */
function extractTemplate(
  promptFn: (input: ReadingInput) => string,
  productCode: ProductCode
): string {
  // Вызываем функцию с тестовыми значениями
  const testInput: ReadingInput = {
    name: 'TEST_NAME_PLACEHOLDER',
    age: 'TEST_AGE_PLACEHOLDER',
    question: 'TEST_QUESTION_PLACEHOLDER',
    rawPersonalization: 'TEST_PERSONALIZATION_PLACEHOLDER',
  }

  // Получаем шаблон с тестовыми значениями
  let template = promptFn(testInput)

  // Заменяем тестовые значения обратно на плейсхолдеры
  template = template.replace(/TEST_NAME_PLACEHOLDER/g, "${input.name ?? 'not provided'}")
  template = template.replace(/TEST_AGE_PLACEHOLDER/g, "${input.age ?? 'not provided'}")
  template = template.replace(/TEST_QUESTION_PLACEHOLDER/g, "${input.question ?? 'not clearly stated'}")
  template = template.replace(/TEST_PERSONALIZATION_PLACEHOLDER/g, "${input.rawPersonalization ?? ''}")

  return template
}

async function seedPrompts() {
  console.log('🌱 Начало переноса промптов в базу данных...\n')

  let added = 0
  let skipped = 0

  // Проходим по всем продуктам
  for (const [productCode, product] of Object.entries(PRODUCTS)) {
    const code = productCode as ProductCode
    const promptBuilder = PRODUCT_PROMPTS[code]

    if (!promptBuilder) {
      console.log(`⏭️  Пропущен ${code} - нет кастомного промпта (будет использоваться автогенерация)`)
      skipped++
      continue
    }

    try {
      // Проверяем, существует ли уже промпт
      const existing = await prisma.prompt.findUnique({
        where: { productCode: code },
      })

      if (existing) {
        console.log(`♻️  Обновлен ${code}`)
        // Обновляем существующий промпт
        const template = extractTemplate(promptBuilder, code)
        await prisma.prompt.update({
          where: { productCode: code },
          data: {
            template,
            category: product.category,
            isCustom: true,
            updatedAt: new Date(),
          },
        })
      } else {
        console.log(`✅ Добавлен ${code}`)
        // Создаем новый промпт
        const template = extractTemplate(promptBuilder, code)
        await prisma.prompt.create({
          data: {
            productCode: code,
            template,
            category: product.category,
            isCustom: true,
          },
        })
        added++
      }
    } catch (error) {
      console.error(`❌ Ошибка при обработке ${code}:`, error)
    }
  }

  console.log(`\n✨ Готово!`)
  console.log(`   Добавлено: ${added}`)
  console.log(`   Обновлено: ${Object.keys(PRODUCTS).length - added - skipped}`)
  console.log(`   Пропущено: ${skipped}`)
}

seedPrompts()
  .catch((error) => {
    console.error('❌ Ошибка при переносе промптов:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

