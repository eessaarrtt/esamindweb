import { type ReactNode } from 'react'

type CardProps = {
  title?: string
  description?: string
  children?: ReactNode
  className?: string
  href?: string
}

export function Card({ title, description, children, className = '', href }: CardProps) {
  const baseClasses = 'bg-card border border-card-border rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5'
  const classes = `${baseClasses} ${className} ${href ? 'cursor-pointer' : ''}`

  const content = (
    <>
      {title && (
        <h3 className="text-xl font-serif text-foreground mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-muted mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </>
  )

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    )
  }

  return <div className={classes}>{content}</div>
}

