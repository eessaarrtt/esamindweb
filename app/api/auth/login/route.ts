import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createSession } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { config } from 'dotenv'
import { resolve } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    logger.info('Login attempt', { email })

    // Load .env file directly to avoid Next.js parsing issues with $ in bcrypt hashes
    const dotenvConfig = config({ path: resolve(process.cwd(), '.env') })
    
    const adminEmail = process.env.ADMIN_EMAIL || dotenvConfig.parsed?.ADMIN_EMAIL
    const adminPasswordHash = dotenvConfig.parsed?.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH

    logger.debug('Admin credentials check', { 
      hasEmail: !!adminEmail,
      hasHash: !!adminPasswordHash,
      hashLength: adminPasswordHash?.length || 0,
      hashPrefix: adminPasswordHash?.substring(0, 20) || 'missing',
      hashSuffix: adminPasswordHash?.substring(adminPasswordHash.length - 10) || 'missing',
      fullHash: adminPasswordHash || 'missing'
    })

    if (!adminEmail || !adminPasswordHash) {
      logger.error('Admin credentials not configured')
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      )
    }

    if (adminPasswordHash.length < 60) {
      logger.error('Invalid password hash length', { 
        hashLength: adminPasswordHash.length,
        expectedLength: 60
      })
      return NextResponse.json(
        { error: 'Invalid password hash configuration' },
        { status: 500 }
      )
    }

    if (email !== adminEmail) {
      logger.warn('Login failed: email mismatch', { email, expectedEmail: adminEmail })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await verifyPassword(password, adminPasswordHash)
    if (!isValid) {
      logger.warn('Login failed: invalid password', { email })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await createSession(email)
    logger.info('Login successful', { email })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Login error', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

