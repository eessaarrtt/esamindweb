import OpenAI from 'openai'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    client = new OpenAI({ apiKey })
  }
  return client
}

export async function generateReading(prompt: string): Promise<string> {
  const openaiClient = getClient()
  const res = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
  })
  return res.choices[0]?.message?.content ?? ''
}

