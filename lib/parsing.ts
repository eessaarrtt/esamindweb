export type ParsedPersonalization = {
  name?: string
  age?: string
  question?: string
  rawPersonalization?: string
}

export function parsePersonalization(text: string | null | undefined): ParsedPersonalization {
  if (!text) {
    return { rawPersonalization: text ?? undefined }
  }

  const lines = text.split('\n').map((line) => line.trim())
  const result: ParsedPersonalization = {
    rawPersonalization: text,
  }

  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.startsWith('name:')) {
      result.name = line.substring(5).trim()
    } else if (lowerLine.startsWith('age:')) {
      result.age = line.substring(4).trim()
    } else if (lowerLine.startsWith('question:')) {
      result.question = line.substring(9).trim()
    }
  }

  return result
}

