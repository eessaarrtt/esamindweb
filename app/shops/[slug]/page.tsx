import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Footer } from '@/components/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'
import { SHOPS } from '@/lib/shops'

export default async function ShopDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  // Try to get shop from database first
  let shop = null
  try {
    shop = await prisma.shop.findUnique({
      where: { slug: params.slug },
    })
  } catch (error) {
    console.error('Error fetching shop from database:', error)
  }

  // Fall back to static data if not in database
  if (!shop) {
    shop = SHOPS.find((s) => s.id === params.slug) as any
  }

  if (!shop) {
    notFound()
  }

  const shopName = 'name' in shop ? shop.name : shop.name
  const shopCategory = 'category' in shop ? shop.category : shop.categories[0]
  const shopDescription = 'description' in shop ? shop.description : shop.shortDescription
  const shopLongDescription = 'longDescription' in shop ? undefined : ('longDescription' in shop ? shop.longDescription : shop.description)
  const shopImageUrl = 'imageUrl' in shop ? shop.imageUrl : undefined
  const shopExternalUrl = 'externalUrl' in shop ? shop.externalUrl : undefined

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageShell>
        <BackLink href="/shops">
          Back to Shops
        </BackLink>

        {/* Shop Overview */}
        <div className="mb-12">
          {shopImageUrl && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={shopImageUrl}
                alt={shopName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          )}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-card border border-card-border text-sm text-muted rounded mb-4">
              {shopCategory}
            </span>
            <h1 className="text-5xl md:text-6xl font-serif mb-6 text-foreground">
              {shopName}
            </h1>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-foreground max-w-3xl">
            <p>{shopDescription}</p>
            <p>
              This shop operates as an independent marketplace under the ESAMIND brand, maintaining its own unique identity while sharing the core values of quality, intentional design, and mindful creation that define ESAMIND.
            </p>
          </div>
        </div>

        {/* Shop Details */}
        <Section title="About This Shop">
          <div className="space-y-6 max-w-3xl">
            <p className="text-lg leading-relaxed">
              Each ESAMIND shop is carefully crafted to serve its specific community and purpose. This shop reflects the brand's commitment to creating meaningful digital experiences, regardless of category or niche.
            </p>
            <p className="text-lg leading-relaxed">
              What makes this shop unique is its focus on its particular direction and audience, while benefiting from the shared infrastructure, values, and aesthetic that connect all ESAMIND projects.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-card border border-card-border rounded-lg p-6">
                <h3 className="text-lg font-serif mb-3 text-foreground">Quality Standards</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Every product in this shop meets ESAMIND's high standards for quality, clarity, and thoughtful design.
                </p>
              </div>
              <div className="bg-card border border-card-border rounded-lg p-6">
                <h3 className="text-lg font-serif mb-3 text-foreground">Independent Identity</h3>
                <p className="text-muted text-sm leading-relaxed">
                  While part of the ESAMIND family, this shop maintains its own unique voice and serves its specific community.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Frequently Asked Questions */}
        <Section title="Frequently Asked Questions">
          <div className="space-y-6 max-w-3xl">
            <Card
              title="How do I purchase from this shop?"
              description="You can visit the shop directly through the link below. Each shop operates on its own platform and has its own checkout process."
            />
            <Card
              title="What makes this shop part of ESAMIND?"
              description="This shop shares ESAMIND's core values of quality, intentional design, and mindful creation. While it operates independently, it benefits from the shared brand identity and infrastructure."
            />
            <Card
              title="Can I contact the shop directly?"
              description="For shop-specific questions, please message directly through the shop platform. For general ESAMIND inquiries, visit our contact page."
            />
          </div>
        </Section>

        {/* Visit Shop Button */}
        {shopExternalUrl && (
          <div className="mt-12">
            <Button
              href={shopExternalUrl}
              variant="primary"
              className="text-lg px-8 py-4"
            >
              Visit Shop
            </Button>
          </div>
        )}
      </PageShell>
      <Footer />
    </div>
  )
}
