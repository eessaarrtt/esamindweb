import Image from 'next/image'
import { Footer } from '@/components/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'
import { ImageBlock } from '@/components/ui/ImageBlock'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageShell title="About ESAMIND">
        <BackLink href="/">
          Back to Home
        </BackLink>

        {/* About ESAMIND */}
        <Section title="About ESAMIND">
          <div className="space-y-6 max-w-3xl">
            <p className="text-lg leading-relaxed">
              ESAMIND represents a new approach to creative brand building—one that embraces versatility without sacrificing coherence. The brand was created to serve as a home for multiple independent shops and projects, each with its own identity and purpose, yet connected by shared values and aesthetic principles.
            </p>
            <p className="text-lg leading-relaxed">
              What connects all ESAMIND projects is a commitment to quality, intentional design, and mindful creation. Whether a shop focuses on digital tools, creative services, design assets, or innovative products, it operates under the same standards: clarity, authenticity, and thoughtful execution.
            </p>
            <p className="text-lg leading-relaxed">
              This multi-direction model allows ESAMIND to evolve organically, responding to new ideas and opportunities without being constrained by category or niche. The brand is both a creative platform and a statement of values—a space where diverse digital experiences can thrive under one thoughtful umbrella.
            </p>
          </div>
        </Section>

        {/* The Story Behind ESAMIND */}
        <Section title="The Story Behind ESAMIND" eyebrow="Our Origin">
          <ImageBlock
            imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop"
            alt="Creative workspace and ideation"
            title="Born from Flexibility"
            description="ESAMIND was born from a recognition that creative work doesn't need to be confined to a single category or niche. The brand emerged as a response to the limitations of traditional single-focus businesses, which often struggle to adapt when new opportunities arise or when creative interests evolve."
            imagePosition="left"
          >
            <p className="text-muted leading-relaxed">
              Instead of choosing one direction and sticking to it, ESAMIND was designed to be flexible—a platform that could support multiple creative endeavors while maintaining a cohesive identity. This approach allows for experimentation, growth, and the freedom to explore new ideas without starting from scratch each time.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              Today, ESAMIND serves as both a creative laboratory and a trusted brand, connecting diverse shops and projects under shared values of quality, intention, and mindful creation. The brand continues to evolve, always open to new directions while staying true to its core principles.
            </p>
          </ImageBlock>
        </Section>

        {/* About the Creator */}
        <Section title="About the Creator">
          <ImageBlock
            imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop"
            alt="Creative professional at work"
            title="Esara Vance"
            description="Esara Vance is the creative mind behind ESAMIND. With a background spanning multiple disciplines, Esara brings a versatile approach to building digital experiences. The philosophy is simple: create with purpose, build with care, and maintain the flexibility to explore new directions."
            imagePosition="right"
          >
            <p className="text-muted leading-relaxed">
              This versatility is reflected in ESAMIND's multi-shop ecosystem. One project might explore thoughtful digital tools, another might focus on creative services, while others might emphasize design or innovation. What unites them is Esara's commitment to quality, intentional design, and authentic connection with each project's unique audience.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              Esara approaches each new shop or project as both a creative experiment and a carefully crafted experience. The goal is never to fit into a single category, but to create meaningful digital spaces that serve their communities well, regardless of their specific focus or industry.
            </p>
          </ImageBlock>
          <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl">
            <div className="bg-card border border-card-border rounded-lg p-6 text-center">
              <h4 className="text-lg font-serif mb-2 text-foreground">Versatile</h4>
              <p className="text-sm text-muted leading-relaxed">
                Comfortable working across multiple disciplines and creative directions
              </p>
            </div>
            <div className="bg-card border border-card-border rounded-lg p-6 text-center">
              <h4 className="text-lg font-serif mb-2 text-foreground">Intentional</h4>
              <p className="text-sm text-muted leading-relaxed">
                Every decision is made with purpose and consideration for the end user
              </p>
            </div>
            <div className="bg-card border border-card-border rounded-lg p-6 text-center">
              <h4 className="text-lg font-serif mb-2 text-foreground">Adaptive</h4>
              <p className="text-sm text-muted leading-relaxed">
                Open to new ideas and flexible enough to evolve with changing needs
              </p>
            </div>
          </div>
        </Section>

        {/* The Long-Term Vision */}
        <Section title="The Long-Term Vision">
          <div className="space-y-6 max-w-3xl">
            <p className="text-lg leading-relaxed">
              ESAMIND is designed to grow as a multi-shop ecosystem—a creative laboratory where new ideas can be tested, refined, and launched as independent marketplaces. Each shop maintains its own identity while benefiting from the shared infrastructure, values, and aesthetic that define the ESAMIND brand.
            </p>
            <p className="text-lg leading-relaxed">
              The vision extends beyond individual shops. ESAMIND aims to become a trusted platform for diverse digital creation, capable of supporting everything from creative services to digital products, design assets to innovative tools. The brand remains flexible enough to adapt to new opportunities while maintaining its core commitment to quality and intentional design.
            </p>
            <p className="text-lg leading-relaxed">
              As ESAMIND evolves, it will continue to serve as both a creative platform and a statement of values—a space where thoughtful digital experiences can thrive, regardless of their specific category or niche. The future is open, and ESAMIND is built to embrace it.
            </p>
          </div>
          <div className="mt-8 bg-card border border-card-border rounded-lg p-8 max-w-3xl">
            <h3 className="text-2xl font-serif mb-4 text-foreground">Looking Ahead</h3>
            <ul className="space-y-3 text-muted">
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">•</span>
                <span>Expanding the ESAMIND ecosystem with new shops and creative projects</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">•</span>
                <span>Building stronger connections between shops while maintaining their independence</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">•</span>
                <span>Exploring new creative directions and opportunities as they arise</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">•</span>
                <span>Maintaining the brand's commitment to quality and intentional design</span>
              </li>
            </ul>
          </div>
        </Section>

        <div className="mt-12 pt-8 border-t border-border">
          <Button href="/ethos" variant="secondary" showArrow>
            Learn more about ESAMIND's philosophy
          </Button>
        </div>
      </PageShell>
      <Footer />
    </div>
  )
}
