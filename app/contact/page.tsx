import Image from 'next/image'
import { Footer } from '@/components/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageShell title="Contact">
        <BackLink href="/">
          Back to Home
        </BackLink>

        <Section>
          <div className="space-y-8 max-w-3xl">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
              <div>
                <p className="text-lg leading-relaxed text-foreground">
                  ESAMIND is a creative brand platform that connects multiple independent shops and projects. Whether you have questions about the brand, want to collaborate, or need support with a specific shop, we're here to help.
                </p>
              </div>
              <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=800&fit=crop"
                  alt="Communication and connection"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card
                title="General Inquiries"
                description="For questions about ESAMIND as a brand, partnerships, or general inquiries, please reach out through your preferred method. We aim to respond to all messages within 24-48 hours during business days."
              />
              <Card
                title="Shop-Specific Questions"
                description="For shop-specific questions, please message directly through the shop platform. Each ESAMIND shop operates independently and has its own support channels, ensuring you receive the most relevant assistance for your inquiry."
              />
              <Card
                title="Collaboration & Opportunities"
                description="ESAMIND is always open to thoughtful collaborations and new opportunities. If you have an idea for a partnership or project that aligns with our values and aesthetic, we'd love to hear from you."
                className="md:col-span-2"
              />
              <Card
                title="Press & Media"
                description="For press inquiries, media requests, or interview opportunities, please reach out with details about your publication or platform. We're happy to share the ESAMIND story and vision."
              />
              <Card
                title="Technical Support"
                description="For technical issues related to ESAMIND's website or platform, please contact us directly. For shop-specific technical issues, please reach out through the individual shop's support channels."
              />
            </div>

            <div className="bg-card border border-card-border rounded-lg p-8 mt-8">
              <h3 className="text-2xl font-serif mb-4 text-foreground">Response Times</h3>
              <div className="space-y-3 text-muted">
                <p className="flex justify-between">
                  <span>General inquiries:</span>
                  <span className="font-medium text-foreground">24-48 hours</span>
                </p>
                <p className="flex justify-between">
                  <span>Collaboration requests:</span>
                  <span className="font-medium text-foreground">3-5 business days</span>
                </p>
                <p className="flex justify-between">
                  <span>Press inquiries:</span>
                  <span className="font-medium text-foreground">5-7 business days</span>
                </p>
                <p className="flex justify-between">
                  <span>Technical support:</span>
                  <span className="font-medium text-foreground">24-72 hours</span>
                </p>
              </div>
              <p className="text-sm text-muted mt-6 italic">
                Please note that response times may vary during holidays or high-volume periods. We appreciate your patience.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-border text-center">
              <p className="text-muted mb-4">
                Thank you for your interest in ESAMIND. We look forward to connecting with you.
              </p>
              <div className="flex gap-4 justify-center">
                <Button href="/" variant="secondary">
                  Return to Home
                </Button>
                <Button href="/shops" variant="primary">
                  Explore Shops
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </PageShell>
      <Footer />
    </div>
  )
}
