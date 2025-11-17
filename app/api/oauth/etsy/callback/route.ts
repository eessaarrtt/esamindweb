import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { connectEtsyShop } from '@/lib/shops'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    logger.warn('Unauthorized OAuth callback attempt')
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  logger.info('Etsy OAuth callback received', { hasCode: !!code, hasError: !!error })

  if (error) {
    logger.warn('Etsy OAuth error', { error })
    return NextResponse.redirect(
      new URL('/dashboard/shops?error=' + encodeURIComponent(error), process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }

  if (!code) {
    logger.warn('Etsy OAuth callback missing code')
    return NextResponse.redirect(
      new URL('/dashboard/shops?error=no_code', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }

  try {
    await connectEtsyShop(code)

    return NextResponse.redirect(
      new URL('/dashboard/shops?success=connected', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  } catch (error) {
    logger.error('OAuth callback error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.redirect(
      new URL('/dashboard/shops?error=connection_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }
}

