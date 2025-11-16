import { SHOPS } from '@/lib/shops'
import { prisma } from '@/lib/prisma'

export async function generateStaticParams() {
  // Get shops from database
  let dbShops: Array<{ slug: string }> = []
  try {
    dbShops = await prisma.shop.findMany({
      select: { slug: true },
    })
  } catch (error) {
    console.error('Error fetching shops for static generation:', error)
  }

  // Combine database shops with static shops
  const allShops = [
    ...dbShops.map((shop) => ({ slug: shop.slug })),
    ...SHOPS.map((shop) => ({ slug: shop.id })),
  ]

  return allShops.map((shop) => ({
    slug: shop.slug,
  }))
}

