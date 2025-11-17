import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }

  const clientId = process.env.ETSY_CLIENT_ID
  const redirectUri = process.env.ETSY_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Etsy OAuth not configured' },
      { status: 500 }
    )
  }

  const scopes = [
    'shops_r',
    'shops_w',
    'listings_r',
    'listings_w',
    'transactions_r',
    'transactions_w',
    'conversations_r', // Чтение conversations (для поиска существующих)
    'conversations_w', // Создание и отправка сообщений покупателям
  ].join(' ')

  const authUrl = `https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&client_id=${clientId}&state=esamind`

  return NextResponse.redirect(authUrl)
}

