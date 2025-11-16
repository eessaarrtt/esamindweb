import { NextRequest, NextResponse } from 'next/server'
import { exchangeEtsyCode, EtsyClient } from '@/lib/etsy'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL('/dashboard/shops?error=' + encodeURIComponent(error), process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/shops?error=no_code', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }

  try {
    const { access_token, refresh_token } = await exchangeEtsyCode(code)
    const client = new EtsyClient(access_token)

    // Get shop info - we need to get the shop ID from the token or make an API call
    // For now, we'll try to get it from the token response or use a default
    // Etsy API v3 requires us to know the shop ID, so we might need to adjust this
    // Let's assume we can get it from the user's shops endpoint
    const shopsResponse = await fetch('https://api.etsy.com/v3/application/users/me/shops', {
      headers: {
        'x-api-key': process.env.ETSY_CLIENT_ID!,
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!shopsResponse.ok) {
      throw new Error('Failed to fetch shop info')
    }

    const shopsData = await shopsResponse.json()
    const shop = shopsData.results?.[0]

    if (!shop) {
      throw new Error('No shop found')
    }

    const shopInfo = await client.getShopInfo(String(shop.shop_id))

    // Upsert shop
    await prisma.etsyShop.upsert({
      where: { etsyShopId: String(shopInfo.shop_id) },
      update: {
        name: shopInfo.shop_name,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
      create: {
        name: shopInfo.shop_name,
        etsyShopId: String(shopInfo.shop_id),
        accessToken: access_token,
        refreshToken: refresh_token,
      },
    })

    return NextResponse.redirect(
      new URL('/dashboard/shops?success=connected', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/shops?error=connection_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    )
  }
}

