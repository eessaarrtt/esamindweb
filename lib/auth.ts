import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { logger } from './logger'

const SESSION_COOKIE_NAME = 'esamind_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production'

export async function hashPassword(password: string): Promise<string> {
  logger.debug('Hashing password')
  const hash = await bcrypt.hash(password, 10)
  logger.debug('Password hashed successfully')
  return hash
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  logger.debug('Verifying password', { 
    passwordLength: password.length,
    hashLength: hash?.length || 0,
    hashPrefix: hash?.substring(0, 20) || 'missing'
  })
  try {
    if (!hash || hash.length < 60) {
      logger.error('Invalid hash format', { hashLength: hash?.length || 0 })
      return false
    }
    const isValid = await bcrypt.compare(password, hash)
    logger.debug('Password verification result', { isValid, hashLength: hash.length })
    return isValid
  } catch (error) {
    logger.error('Password verification error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return false
  }
}

export async function createSession(userId: string): Promise<void> {
  logger.info('Creating session', { userId })
  try {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    logger.info('Session created successfully', { userId })
  } catch (error) {
    logger.error('Failed to create session', { 
      userId,
      error: error instanceof Error ? error.message : String(error) 
    })
    throw error
  }
}

export async function getSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE_NAME)
    const sessionValue = session?.value || null
    logger.debug('Session retrieved', { hasSession: !!sessionValue })
    return sessionValue
  } catch (error) {
    logger.error('Failed to get session', { 
      error: error instanceof Error ? error.message : String(error) 
    })
    return null
  }
}

export async function deleteSession(): Promise<void> {
  logger.info('Deleting session')
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    logger.info('Session deleted successfully')
  } catch (error) {
    logger.error('Failed to delete session', { 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
}

export async function requireAuth(): Promise<void> {
  const session = await getSession()
  if (!session) {
    logger.warn('Authentication required but no session found')
    throw new Error('Unauthorized')
  }
  logger.debug('Authentication check passed', { userId: session })
}

