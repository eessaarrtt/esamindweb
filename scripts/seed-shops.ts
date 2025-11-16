import { PrismaClient } from '../app/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Example shops - you can customize these
  const shops = [
    {
      slug: 'example-shop-1',
      name: 'Example Shop One',
      description: 'A thoughtfully crafted marketplace offering unique digital experiences and creative solutions.',
      category: 'Digital Tools',
      externalUrl: 'https://example.com',
      featured: true,
    },
    {
      slug: 'example-shop-2',
      name: 'Example Shop Two',
      description: 'An independent shop focused on quality design and intentional creation.',
      category: 'Design',
      externalUrl: 'https://example.com',
      featured: true,
    },
  ]

  for (const shop of shops) {
    await prisma.shop.upsert({
      where: { slug: shop.slug },
      update: shop,
      create: shop,
    })
  }

  console.log('Shops seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

