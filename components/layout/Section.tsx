import { type ReactNode } from 'react'

type SectionProps = {
  title?: string
  eyebrow?: string
  children: ReactNode
  className?: string
}

export function Section({ title, eyebrow, children, className = '' }: SectionProps) {
  return (
    <section className={`mb-16 ${className}`}>
      {eyebrow && (
        <p className="text-sm uppercase tracking-wide text-muted mb-2">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="text-3xl md:text-4xl font-serif mb-8 text-foreground">
          {title}
        </h2>
      )}
      <div className="text-lg leading-relaxed text-foreground">
        {children}
      </div>
    </section>
  )
}

