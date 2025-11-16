import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Footer } from '@/components/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
import { ShopCard } from '@/components/ui/ShopCard'
import { Button } from '@/components/ui/Button'
import { ImageBlock } from '@/components/ui/ImageBlock'

export default async function Home() {
  // Safely get featured shops, handle case where Shop model might not be available yet
  let featuredShops: Array<{ id: number; slug: string; name: string; description: string; category: string }> = []
  try {
    featuredShops = await prisma.shop.findMany({
      where: { featured: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching shops:', error)
    featuredShops = []
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-7 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="text-6xl md:text-7xl font-serif mb-8 text-foreground leading-tight">
                ESAMIND
              </h1>
              <p className="text-2xl md:text-3xl mb-6 text-muted font-light leading-relaxed">
                A mindful home for meaningful digital creation
              </p>
              <p className="text-lg text-muted max-w-2xl leading-relaxed mb-8">
                ESAMIND is a multi-direction creative brand platform, connecting independent shops and projects under one thoughtful umbrella. Each shop operates with its own identity while sharing our commitment to quality, intentional design, and mindful creation.
              </p>
              <div className="flex gap-4">
                <Button href="/shops" variant="primary">
                  Explore Shops
                </Button>
                <Button href="/about" variant="secondary">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop"
                alt="Creative workspace"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <PageShell>
        {/* Stats Section */}
        <Section title="ESAMIND by the Numbers" eyebrow="Our Impact">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-card-border rounded-lg p-6 text-center hover:shadow-md transition-all hover:border-accent/30">
              <div className="text-4xl font-bold text-accent mb-2">10+</div>
              <div className="text-sm text-muted">Active Shops</div>
            </div>
            <div className="bg-card border border-card-border rounded-lg p-6 text-center hover:shadow-md transition-all hover:border-accent/30">
              <div className="text-4xl font-bold text-success mb-2">500+</div>
              <div className="text-sm text-muted">Happy Customers</div>
            </div>
            <div className="bg-card border border-card-border rounded-lg p-6 text-center hover:shadow-md transition-all hover:border-accent/30">
              <div className="text-4xl font-bold text-info mb-2">50+</div>
              <div className="text-sm text-muted">Products Available</div>
            </div>
          </div>
        </Section>

        {/* What ESAMIND Is */}
        <Section title="What ESAMIND Is">
          <ImageBlock
            imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop"
            alt="Creative collaboration and workspace"
            title="A Multi-Direction Creative Platform"
            description="ESAMIND is a personal creative brand built to host multiple independent shops and projects. Each shop operates with its own identity, products, and audience, while ESAMIND serves as the connective thread that binds them together."
            imagePosition="right"
          >
            <p className="text-muted leading-relaxed">
              Rather than confining creativity to a single niche, ESAMIND embraces versatility. One shop might offer thoughtful digital tools, another might explore creative services, while others might focus on design or innovation. What unites them is a shared commitment to quality, intention, and mindful creation.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              This multi-direction approach allows the brand to evolve organically, responding to new ideas and opportunities without being limited by category. ESAMIND is both a creative laboratory and a trusted home for diverse digital experiences.
            </p>
          </ImageBlock>
        </Section>

        {/* Shops Preview */}
        {featuredShops.length > 0 && (
          <Section title="ESAMIND Shops">
            <p className="text-muted mb-12 max-w-2xl leading-relaxed">
              ESAMIND operates multiple independent marketplaces, each with its own style, purpose, and community. Explore our current shops below.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  name={shop.name}
                  description={shop.description}
                  categories={[shop.category]}
                  href={`/shops/${shop.slug}`}
                  imageUrl={undefined}
                />
              ))}
            </div>
            <div className="text-center">
              <Button href="/shops" variant="secondary">
                View All Shops
              </Button>
            </div>
          </Section>
        )}

        {/* How It Works */}
        <Section title="How ESAMIND Works" eyebrow="Our Process">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-serif mb-3 text-foreground">Discover</h3>
              <p className="text-muted leading-relaxed">
                Explore our diverse range of shops, each offering unique products and experiences tailored to different needs and interests.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-serif mb-3 text-foreground">Choose</h3>
              <p className="text-muted leading-relaxed">
                Select the shop and products that resonate with you. Each shop maintains its own identity while sharing ESAMIND's quality standards.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-serif mb-3 text-foreground">Experience</h3>
              <p className="text-muted leading-relaxed">
                Enjoy thoughtfully crafted digital experiences designed with intention, quality, and your needs in mind.
              </p>
            </div>
          </div>
        </Section>

        {/* Key Features */}
        <Section title="Why ESAMIND" eyebrow="What Sets Us Apart">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-foreground">Multi-Direction Flexibility</h3>
              <p className="text-muted leading-relaxed">
                Unlike single-niche brands, ESAMIND embraces versatility. Our shops span multiple categories—from digital tools to creative services—all united by shared values and quality standards.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-foreground">Thoughtful Creation</h3>
              <p className="text-muted leading-relaxed">
                Every product and service is crafted with intention. We prioritize clarity, quality, and meaningful experiences over quick solutions or generic templates.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-foreground">Independent Yet Connected</h3>
              <p className="text-muted leading-relaxed">
                Each shop operates independently with its own identity, while benefiting from ESAMIND's shared infrastructure, aesthetic, and commitment to excellence.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-foreground">Evolving Platform</h3>
              <p className="text-muted leading-relaxed">
                ESAMIND is designed to grow and adapt. New shops and projects can be added organically, allowing the brand to explore new directions while maintaining its core identity.
              </p>
            </div>
          </div>
        </Section>

        {/* Brand Direction */}
        <Section title="Brand Direction">
          <ImageBlock
            imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop"
            alt="Minimalist design and thoughtful creation"
            title="Built on Principles, Not Products"
            description="ESAMIND is built on a foundation of clarity, quality, and intentional design. The brand aesthetic is minimal yet warm, mysterious but accessible, professional yet human. Every shop and project under the ESAMIND umbrella reflects these core principles."
            imagePosition="left"
          >
            <p className="text-muted leading-relaxed">
              The philosophy is simple: create with purpose, build with care, and maintain the flexibility to explore new directions. ESAMIND is not defined by what it sells, but by how it creates—thoughtfully, ethically, and with attention to both form and function.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              This approach allows the brand to remain timeless and adaptable, capable of supporting diverse creative endeavors while maintaining a cohesive identity. ESAMIND is both a creative platform and a statement of values.
            </p>
          </ImageBlock>
        </Section>
      </PageShell>

      <Footer />
    </div>
  )
}
