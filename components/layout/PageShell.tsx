import { type ReactNode } from 'react'

type PageShellProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function PageShell({ title, subtitle, children, className = '' }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-background text-foreground ${className}`}>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          {title && (
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-serif mb-4 text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg md:text-xl text-muted max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

