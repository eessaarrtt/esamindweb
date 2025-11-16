import Image from 'next/image'
import { Footer } from '@/components/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'
import { ImageBlock } from '@/components/ui/ImageBlock'

export default function EthosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageShell title="Ethos">
        <BackLink href="/">
          Back to Home
        </BackLink>

        {/* The ESAMIND Approach */}
        <Section title="The ESAMIND Approach">
          <div className="space-y-6 max-w-3xl">
            <p className="text-lg leading-relaxed">
              ESAMIND is built on a philosophy of creativity, clarity, and intention. Every shop, product, and project under the ESAMIND umbrella reflects these core principles, creating a cohesive brand experience that transcends individual categories or niches.
            </p>
            <p className="text-lg leading-relaxed">
              The approach is simple: create with purpose, build with care, and maintain the flexibility to explore new directions. ESAMIND is not defined by what it sells, but by how it creates—thoughtfully, ethically, and with attention to both form and function.
            </p>
            <p className="text-lg leading-relaxed">
              This philosophy extends to every aspect of the brand, from the aesthetic choices that define its visual identity to the values that guide its creative decisions. ESAMIND is both a creative platform and a statement of principles—a space where diverse digital experiences can thrive under one thoughtful umbrella.
            </p>
          </div>
        </Section>

        {/* Design Philosophy */}
        <Section title="Design Philosophy" eyebrow="Visual Identity">
          <ImageBlock
            imageUrl="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=800&fit=crop"
            alt="Minimalist design workspace"
            title="Intentional Aesthetics"
            description="ESAMIND's visual identity is intentionally minimal yet warm, mysterious but accessible. The design language prioritizes clarity and readability while maintaining a sense of sophistication and calm. This aesthetic serves as a neutral foundation that can support shops across diverse categories without feeling out of place."
            imagePosition="left"
          >
            <p className="text-muted leading-relaxed">
              Typography, spacing, and color choices are made with intention, ensuring that every element serves a purpose. The brand avoids unnecessary decoration or trend-driven design, instead focusing on timeless principles that will remain relevant as the platform evolves.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-card border border-card-border rounded-lg p-4 text-center">
                <h4 className="font-serif mb-2 text-foreground text-sm">Minimal</h4>
                <p className="text-xs text-muted">Clean, uncluttered, purposeful</p>
              </div>
              <div className="bg-card border border-card-border rounded-lg p-4 text-center">
                <h4 className="font-serif mb-2 text-foreground text-sm">Warm</h4>
                <p className="text-xs text-muted">Inviting, human, approachable</p>
              </div>
              <div className="bg-card border border-card-border rounded-lg p-4 text-center">
                <h4 className="font-serif mb-2 text-foreground text-sm">Flexible</h4>
                <p className="text-xs text-muted">Adaptable, versatile, timeless</p>
              </div>
            </div>
          </ImageBlock>
        </Section>

        {/* Values */}
        <Section title="Values">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            <Card
              title="Clarity"
              description="Every ESAMIND project prioritizes clarity—in communication, design, and purpose. We believe that the best digital experiences are those that are immediately understandable, without unnecessary complexity or confusion."
            />
            <Card
              title="Quality"
              description="Quality is non-negotiable. Every product, service, and experience under the ESAMIND brand is crafted with attention to detail, ensuring that each interaction meets our high standards for excellence."
            />
            <Card
              title="Mindfulness"
              description="We approach every project with mindfulness—considering not just what we create, but why we create it and how it serves its intended audience. This intentional approach ensures that every ESAMIND project has purpose and meaning."
            />
            <Card
              title="Originality"
              description="ESAMIND values originality and authentic expression. While we draw inspiration from many sources, every project is crafted with its own unique identity and voice, avoiding generic templates or formulaic approaches."
            />
            <Card
              title="Ethical Digital Creation"
              description="We are committed to ethical digital creation—respecting user privacy, creating accessible experiences, and building sustainable practices into every project. ESAMIND believes that technology should serve people, not the other way around."
              className="md:col-span-2"
            />
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted italic">
              These values guide every decision we make and every product we create.
            </p>
          </div>
        </Section>

        {/* How ESAMIND Builds */}
        <Section title="How ESAMIND Builds">
          <div className="space-y-6 max-w-3xl">
            <p className="text-lg leading-relaxed">
              New shops and products under the ESAMIND brand are created thoughtfully, with careful consideration of their purpose, audience, and place within the larger ecosystem. Each project begins with a clear vision and is developed through a process that prioritizes quality, authenticity, and meaningful connection.
            </p>
            <p className="text-lg leading-relaxed">
              This cross-discipline approach allows ESAMIND to explore diverse creative directions while maintaining a cohesive brand identity. A shop focused on digital tools might share the same aesthetic principles as one focused on creative services, creating a unified experience that transcends category boundaries.
            </p>
            <p className="text-lg leading-relaxed">
              The building process is iterative and responsive, allowing each project to evolve organically while staying true to ESAMIND's core values. This flexibility is essential to the brand's ability to support diverse creative endeavors while maintaining its identity and standards.
            </p>
          </div>
          <div className="mt-8 bg-card border border-card-border rounded-lg p-8 max-w-3xl">
            <h3 className="text-2xl font-serif mb-6 text-foreground">The Building Process</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">1</span>
                </div>
                <div>
                  <h4 className="font-serif mb-1 text-foreground">Vision & Purpose</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    Every new shop begins with a clear understanding of its purpose, audience, and unique value proposition.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">2</span>
                </div>
                <div>
                  <h4 className="font-serif mb-1 text-foreground">Design & Development</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    Products and experiences are crafted with attention to both aesthetic and functional requirements.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">3</span>
                </div>
                <div>
                  <h4 className="font-serif mb-1 text-foreground">Quality Assurance</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    Every offering undergoes careful review to ensure it meets ESAMIND's standards for quality and clarity.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">4</span>
                </div>
                <div>
                  <h4 className="font-serif mb-1 text-foreground">Launch & Iteration</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    Shops launch with a clear identity, then evolve based on community feedback and changing needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <div className="mt-12 pt-8 border-t border-border">
          <Button href="/about" variant="secondary" showArrow>
            Learn more about ESAMIND
          </Button>
        </div>
      </PageShell>
      <Footer />
    </div>
  )
}
