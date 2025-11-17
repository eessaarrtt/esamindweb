import { prisma } from './prisma'
import { EtsyClient, exchangeCodeForToken } from './etsy'
import { logger } from './logger'

/**
 * Сохраняет или обновляет магазин Etsy в базе данных
 */
export async function saveOrUpdateEtsyShop(
  etsyShopId: string,
  shopName: string,
  accessToken: string,
  refreshToken: string
) {
  logger.info('Saving/updating Etsy shop', { etsyShopId, shopName })

  const shop = await prisma.etsyShop.upsert({
    where: { etsyShopId },
    update: {
      name: shopName,
      accessToken,
      refreshToken,
    },
    create: {
      name: shopName,
      etsyShopId,
      accessToken,
      refreshToken,
    },
  })

  logger.info('Etsy shop saved/updated', { 
    shopId: shop.id, 
    etsyShopId,
    shopName 
  })

  return shop
}

/**
 * Получает информацию о магазине из Etsy API и сохраняет в БД
 */
export async function connectEtsyShop(
  code: string
): Promise<{ shopId: number; shopName: string }> {
  logger.info('Connecting Etsy shop', { hasCode: !!code })

  // Exchange code for tokens
  const { access_token, refresh_token } = await exchangeCodeForToken(code)
  const client = new EtsyClient(access_token)

  // Get user's shops
  logger.debug('Fetching user shops from Etsy')
  const shopsResponse = await fetch('https://api.etsy.com/v3/application/users/me/shops', {
    headers: {
      'x-api-key': process.env.ETSY_CLIENT_ID!,
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (!shopsResponse.ok) {
    logger.error('Failed to fetch user shops', { status: shopsResponse.status })
    throw new Error('Failed to fetch shop info')
  }

  const shopsData = await shopsResponse.json()
  const shop = shopsData.results?.[0]

  if (!shop) {
    logger.warn('No shop found in user shops')
    throw new Error('No shop found')
  }

  logger.info('Shop found', { shopId: shop.shop_id })
  const shopInfo = await client.getShopInfo(String(shop.shop_id))

  // Save to database
  const savedShop = await saveOrUpdateEtsyShop(
    String(shopInfo.shop_id),
    shopInfo.shop_name,
    access_token,
    refresh_token
  )

  return {
    shopId: savedShop.id,
    shopName: savedShop.name,
  }
}
