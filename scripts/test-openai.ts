import 'dotenv/config'
import { generateReading } from '../lib/openai'
import { logger } from '../lib/logger'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(amount)
}

async function testOpenAI() {
  console.log('🤖 Testing OpenAI connection...\n')

  // Проверка переменных окружения
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4o'

  console.log('1. Checking environment variables...')
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables')
    console.log('   Please set OPENAI_API_KEY in your .env or .env.local file')
    process.exit(1)
  }
  console.log(`✅ OPENAI_API_KEY is set (length: ${apiKey.length})`)
  console.log(`✅ OPENAI_MODEL: ${model}\n`)

  // Тестовый промпт
  const testPrompt = `
You are Esara Vance, the intuitive tarot reader behind the ESAMIND brand on Etsy.
Your style: warm, calm, grounded, human.

Product: "Test Reading".

Client information:
Name: Test User
Age: 30
Question or focus: testing OpenAI connection

Write a brief test reading (50-100 words) to verify the connection is working.
Keep it warm and encouraging.
`

  console.log('2. Testing OpenAI API call...')
  console.log(`   Prompt length: ${testPrompt.length} characters`)
  console.log(`   Model: ${model}\n`)

  try {
    const startTime = Date.now()
    const { content: reading, usage } = await generateReading(testPrompt)
    const duration = Date.now() - startTime

    console.log('✅ OpenAI API call successful!')
    console.log(`   Duration: ${duration}ms`)
    console.log(`   Response length: ${reading.length} characters\n`)
    console.log('💰 Usage & Cost:')
    console.log(`   Model: ${usage.model}`)
    console.log(`   Input tokens: ${usage.promptTokens.toLocaleString()}`)
    console.log(`   Output tokens: ${usage.completionTokens.toLocaleString()}`)
    console.log(`   Total tokens: ${usage.totalTokens.toLocaleString()}`)
    console.log(`   Cost: ${formatCurrency(usage.cost)}\n`)
    console.log('📝 Generated reading:')
    console.log('─'.repeat(60))
    console.log(reading)
    console.log('─'.repeat(60))
    console.log('\n✨ OpenAI connection test passed!')
  } catch (error) {
    console.error('❌ OpenAI API call failed:')
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`)
      if (error.message.includes('API key')) {
        console.error('\n   💡 Possible issues:')
        console.error('   - Invalid API key')
        console.error('   - API key not set correctly in .env file')
        console.error('   - API key doesn\'t have access to the model')
      } else if (error.message.includes('rate limit')) {
        console.error('\n   💡 Rate limit exceeded. Please try again later.')
      } else if (error.message.includes('insufficient_quota')) {
        console.error('\n   💡 Insufficient quota. Please check your OpenAI account billing.')
      }
    } else {
      console.error('   Unknown error:', error)
    }
    process.exit(1)
  }
}

testOpenAI()

