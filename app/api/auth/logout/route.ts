import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function POST() {
  logger.info('Logout requested')
  try {
    await deleteSession()
    logger.info('Logout successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Logout error', { 
      error: error instanceof Error ? error.message : String(error) 
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

