import { PrismaClient } from '@/app/generated/prisma/client'
import { logger } from './logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Проверка доступности модели Prompt
if (typeof prisma.prompt === 'undefined') {
  logger.error('Prisma Client: Prompt model is not available', {
    availableModels: Object.keys(prisma).filter(key => !key.startsWith('$')),
  })
} else {
  logger.debug('Prisma Client: Prompt model is available')
}

