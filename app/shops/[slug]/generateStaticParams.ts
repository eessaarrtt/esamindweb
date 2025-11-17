import { prisma } from '@/lib/prisma'

export async function generateStaticParams() {
  // Get shops from database
  const shops = await prisma.shop.findMany({
    select: { slug: true },
  })

  return shops.map((shop) => ({
    slug: shop.slug,
  }))
}

