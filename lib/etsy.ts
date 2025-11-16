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

export class EtsyClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getShopInfo(shopId: string): Promise<EtsyShopInfo> {
    const response = await fetch(`${ETSY_API_BASE}/application/shops/${shopId}`, {
      headers: {
        'x-api-key': process.env.ETSY_CLIENT_ID!,
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch shop info: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      shop_id: data.shop_id,
      shop_name: data.shop_name,
    }
  }

  async getReceipts(shopId: string, limit = 100): Promise<EtsyReceipt[]> {
    const response = await fetch(
      `${ETSY_API_BASE}/application/shops/${shopId}/receipts?limit=${limit}&was_shipped=false&was_digital=true`,
      {
        headers: {
          'x-api-key': process.env.ETSY_CLIENT_ID!,
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch receipts: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results || []
  }

  async getReceiptTransactions(receiptId: number): Promise<EtsyTransaction[]> {
    const response = await fetch(
      `${ETSY_API_BASE}/application/shops/receipts/${receiptId}/transactions`,
      {
        headers: {
          'x-api-key': process.env.ETSY_CLIENT_ID!,
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results || []
  }
}

export async function exchangeEtsyCode(
  code: string
): Promise<{ access_token: string; refresh_token: string }> {
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
    throw new Error(`Failed to exchange code: ${response.status} ${error}`)
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  }
}

