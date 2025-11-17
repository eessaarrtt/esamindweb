import OpenAI from 'openai'
import { logger } from './logger'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      logger.error('OPENAI_API_KEY is not set')
      throw new Error('OPENAI_API_KEY is not set')
    }
    client = new OpenAI({ apiKey })
    logger.debug('OpenAI client initialized')
  }
  return client
}

export interface OpenAIUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  model: string
  cost: number // в USD
}

export async function generateReading(prompt: string): Promise<{ content: string; usage: OpenAIUsage }> {
  const openaiClient = getClient()
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o'
  
  logger.info('Calling OpenAI API', { 
    model, 
    promptLength: prompt.length,
    temperature: 0.8 
  })
  
  try {
    const startTime = Date.now()
    const res = await openaiClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    })
    const duration = Date.now() - startTime
    
    const content = res.choices[0]?.message?.content ?? ''
    
    if (!content) {
      logger.warn('OpenAI returned empty content', { 
        choices: res.choices.length,
        finishReason: res.choices[0]?.finish_reason 
      })
      throw new Error('OpenAI returned empty content')
    }
    
    // Расчет стоимости на основе модели и токенов
    const usage = res.usage
    const responseModel = res.model
    
    // Цены для разных моделей (на ноябрь 2024)
    // gpt-4o: Input $2.50/1M, Output $10.00/1M
    // gpt-4o-mini: Input $0.15/1M, Output $0.60/1M
    // gpt-4-turbo: Input $10.00/1M, Output $30.00/1M
    let inputPricePerMillion = 2.5
    let outputPricePerMillion = 10.0
    
    if (responseModel.includes('mini')) {
      inputPricePerMillion = 0.15
      outputPricePerMillion = 0.6
    } else if (responseModel.includes('turbo')) {
      inputPricePerMillion = 10.0
      outputPricePerMillion = 30.0
    }
    
    const inputCost = (usage.prompt_tokens / 1_000_000) * inputPricePerMillion
    const outputCost = (usage.completion_tokens / 1_000_000) * outputPricePerMillion
    const totalCost = inputCost + outputCost
    
    const usageData: OpenAIUsage = {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      model: responseModel,
      cost: totalCost,
    }
    
    logger.info('OpenAI response received', { 
      contentLength: content.length,
      duration: `${duration}ms`,
      usage: usageData,
      model: res.model
    })
    
    return { content, usage: usageData }
  } catch (error) {
    if (error instanceof Error) {
      // Улучшенная обработка ошибок OpenAI
      if (error.message.includes('API key')) {
        logger.error('OpenAI API key error', { 
          error: error.message,
          hint: 'Check OPENAI_API_KEY environment variable'
        })
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.')
      } else if (error.message.includes('rate_limit')) {
        logger.error('OpenAI rate limit exceeded')
        throw new Error('OpenAI rate limit exceeded. Please try again later.')
      } else if (error.message.includes('insufficient_quota')) {
        logger.error('OpenAI insufficient quota')
        throw new Error('OpenAI account has insufficient quota. Please check your billing.')
      } else if (error.message.includes('model')) {
        logger.error('OpenAI model error', { model: process.env.OPENAI_MODEL ?? 'gpt-4o', error: error.message })
        throw new Error(`OpenAI model error: ${error.message}`)
      }
    }
    
    logger.error('OpenAI API error', { 
      error: error instanceof Error ? error.message : String(error),
      model: process.env.OPENAI_MODEL ?? 'gpt-4o'
    })
    throw error
  }
}

