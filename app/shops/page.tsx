import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Footer } from '@/components/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
import { ShopCard } from '@/components/ui/ShopCard'

export default async function ShopsPage() {
  // Get shops from database
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Group shops by category
  const shopsByCategory = shops.reduce((acc, shop) => {
    const category = shop.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(shop)
    return acc
  }, {} as Record<string, Array<typeof shops[number]>>)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageShell
        title="ESAMIND Shops"
        subtitle="ESAMIND hosts multiple independent shops, each with its own style, purpose, and community. Each shop operates as its own marketplace while sharing the values and aesthetic that define the ESAMIND brand."
      >
        <Section>
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <p className="text-lg leading-relaxed text-foreground mb-4">
                Each ESAMIND shop is carefully curated to serve a specific community and purpose. While they operate independently, all shops share ESAMIND's commitment to quality, intentional design, and mindful creation.
              </p>
              <p className="text-muted leading-relaxed">
                Browse our shops by category below, or explore individual shops to learn more about their unique offerings and how they fit into the ESAMIND ecosystem.
              </p>
            </div>
            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=800&fit=crop"
                alt="Marketplace and shop diversity"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
          </div>
        </Section>

        {shops.length === 0 ? (
          <div className="bg-card border border-card-border p-12 rounded-lg text-center">
            <p className="text-muted">
              No shops available yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(shopsByCategory).map(([category, categoryShops]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif text-foreground">
                    {category}
                  </h2>
                  <span className="text-sm text-muted">
                    {categoryShops.length} {categoryShops.length === 1 ? 'shop' : 'shops'}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryShops.map((shop) => (
                    <ShopCard
                      key={shop.slug}
                      name={shop.name}
                      description={shop.description}
                      categories={[shop.category]}
                      href={`/shops/${shop.slug}`}
                      imageUrl={undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
      <Footer />
    </div>
  )
}
