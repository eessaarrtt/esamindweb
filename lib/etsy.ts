import { logger } from './logger'

const ETSY_API_BASE = 'https://api.etsy.com/v3'

export interface EtsyShopInfo {
  shop_id: number
  shop_name: string
}

export interface EtsyReceipt {
  receipt_id: number
  buyer_name: string
  buyer_user_id: number
  transactions: EtsyTransaction[]
}

export interface EtsyTransaction {
  transaction_id: number
  listing_id: number
  personalization?: string
}

export interface EtsyListing {
  listing_id: number
  title: string
  description?: string
  state?: string // active, inactive, etc.
}

/**
 * Базовая функция для запросов к Etsy API
 */
async function etsyFetch(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${ETSY_API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': process.env.ETSY_CLIENT_ID!,
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    logger.error('Etsy API error', { 
      endpoint, 
      status: response.status, 
      statusText: response.statusText,
      error: errorText
    })
    throw new Error(`Etsy API error: ${response.status} ${errorText}`)
  }

  return response
}

/**
 * Клиент для работы с Etsy API
 * Только HTTP-логика, без работы с БД
 */
export class EtsyClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getShopInfo(shopId: string): Promise<EtsyShopInfo> {
    logger.debug('Fetching Etsy shop info', { shopId })
    
    const response = await etsyFetch(`/application/shops/${shopId}`, this.accessToken)
    const data = await response.json()
    
    logger.debug('Shop info fetched', { shopId, shopName: data.shop_name })
    
    return {
      shop_id: data.shop_id,
      shop_name: data.shop_name,
    }
  }

  async getReceipts(shopId: string, limit = 100, since?: number): Promise<EtsyReceipt[]> {
    logger.debug('Fetching Etsy receipts', { shopId, limit, since })
    
    const params = new URLSearchParams({
      limit: String(limit),
      was_shipped: 'false',
      was_digital: 'true',
    })
    
    if (since) {
      params.append('min_created', String(since))
    }
    
    const response = await etsyFetch(
      `/application/shops/${shopId}/receipts?${params.toString()}`,
      this.accessToken
    )

    const data = await response.json()
    const receipts = data.results || []
    logger.debug('Receipts fetched', { shopId, count: receipts.length })
    
    return receipts
  }

  async getReceiptTransactions(receiptId: number): Promise<EtsyTransaction[]> {
    logger.debug('Fetching receipt transactions', { receiptId })
    
    const response = await etsyFetch(
      `/application/shops/receipts/${receiptId}/transactions`,
      this.accessToken
    )

    const data = await response.json()
    const transactions = data.results || []
    logger.debug('Transactions fetched', { receiptId, count: transactions.length })
    
    return transactions
  }

  /**
   * Получает список активных листингов магазина
   */
  async getShopListings(shopId: string, limit = 100, offset = 0): Promise<EtsyListing[]> {
    logger.debug('Fetching shop listings', { shopId, limit, offset })
    
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      state: 'active', // Только активные листинги
    })
    
    const response = await etsyFetch(
      `/application/shops/${shopId}/listings?${params.toString()}`,
      this.accessToken
    )

    const data = await response.json()
    const listings = data.results || []
    logger.debug('Listings fetched', { shopId, count: listings.length })
    
    return listings.map((listing: any) => ({
      listing_id: listing.listing_id,
      title: listing.title,
      description: listing.description,
      state: listing.state,
    }))
  }

  /**
   * Получает или создает conversation с покупателем
   * Возвращает conversation_id для отправки сообщений
   */
  async getOrCreateConversation(shopId: string, buyerUserId: string): Promise<number> {
    logger.debug('Getting or creating conversation', { shopId, buyerUserId })
    
    // Сначала пытаемся найти существующий conversation
    const response = await etsyFetch(
      `/application/shops/${shopId}/conversations?to_user_id=${buyerUserId}`,
      this.accessToken
    )
    
    const data = await response.json()
    const conversations = data.results || []
    
    if (conversations.length > 0) {
      const conversationId = conversations[0].conversation_id
      logger.debug('Found existing conversation', { conversationId })
      return conversationId
    }
    
    // Если conversation не найден, создаем новый
    logger.debug('Creating new conversation', { shopId, buyerUserId })
    const createResponse = await etsyFetch(
      `/application/shops/${shopId}/conversations`,
      this.accessToken,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_user_id: parseInt(buyerUserId),
        }),
      }
    )
    
    const createData = await createResponse.json()
    const conversationId = createData.conversation_id
    logger.debug('Conversation created', { conversationId })
    
    return conversationId
  }

  /**
   * Отправляет сообщение покупателю через Etsy Conversations API
   */
  async sendMessageToBuyer(
    shopId: string,
    buyerUserId: string,
    message: string
  ): Promise<{ message_id: number; conversation_id: number }> {
    logger.info('Sending message to buyer', { shopId, buyerUserId, messageLength: message.length })
    
    try {
      // Получаем или создаем conversation
      const conversationId = await this.getOrCreateConversation(shopId, buyerUserId)
      
      // Отправляем сообщение
      const response = await etsyFetch(
        `/application/shops/${shopId}/conversations/${conversationId}/messages`,
        this.accessToken,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
          }),
        }
      )
      
      const data = await response.json()
      logger.info('Message sent successfully', { 
        messageId: data.message_id,
        conversationId: data.conversation_id 
      })
      
      return {
        message_id: data.message_id,
        conversation_id: data.conversation_id,
      }
    } catch (error) {
      logger.error('Failed to send message to buyer', {
        shopId,
        buyerUserId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}

/**
 * Обменивает OAuth code на access и refresh токены
 */

export async function exchangeCodeForToken(
  code: string
): Promise<{ access_token: string; refresh_token: string }> {
  logger.info('Exchanging Etsy OAuth code for tokens')
  
  const clientId = process.env.ETSY_CLIENT_ID!
  const clientSecret = process.env.ETSY_CLIENT_SECRET!
  const redirectUri = process.env.ETSY_REDIRECT_URI!

  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
      code_verifier: '', // Etsy v3 may require PKCE, but for now we'll try without
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error('Failed to exchange Etsy OAuth code', { 
      status: response.status, 
      error 
    })
    throw new Error(`Failed to exchange code: ${response.status} ${error}`)
  }

  const data = await response.json()
  logger.info('Etsy OAuth tokens obtained successfully')
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  }
}

// Alias for backward compatibility
export const exchangeEtsyCode = exchangeCodeForToken

/**
 * Обновляет access token используя refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string }> {
  logger.info('Refreshing Etsy access token')
  
  const clientId = process.env.ETSY_CLIENT_ID!
  const clientSecret = process.env.ETSY_CLIENT_SECRET!

  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error('Failed to refresh Etsy access token', { 
      status: response.status, 
      error 
    })
    throw new Error(`Failed to refresh token: ${response.status} ${error}`)
  }

  const data = await response.json()
  logger.info('Etsy access token refreshed successfully')
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Etsy may not return new refresh token
  }
}

