import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/">
                <h3 className="text-xl font-serif text-foreground mb-4 hover:text-accent transition-colors">
                  ESAMIND
                </h3>
              </Link>
              <p className="text-sm text-muted leading-relaxed">
                A mindful home for meaningful digital creation.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted mb-3 uppercase tracking-wide">
                Explore
              </h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/shops" className="hover:text-accent transition-colors">
                    Shops
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-accent transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/ethos" className="hover:text-accent transition-colors">
                    Ethos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted mb-3 uppercase tracking-wide">
                Connect
              </h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/contact" className="hover:text-accent transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted mb-3 uppercase tracking-wide">
                Creator
              </h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link href="/dashboard" className="hover:text-accent transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} ESAMIND. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
