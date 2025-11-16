import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

type BackLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function BackLink({ href, children, className = '' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`text-muted hover:text-accent mb-8 inline-flex items-center gap-2 transition-colors ${className}`}
    >
      <ArrowLeftIcon width={16} height={16} />
      {children}
    </Link>
  )
}

