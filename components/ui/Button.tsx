import Link from 'next/link'
import { type ReactNode } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  showArrow?: boolean
}

export function Button({
  variant = 'primary',
  children,
  href,
  onClick,
  className = '',
  type = 'button',
  showArrow = false,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-[var(--accent-hover)] shadow-sm hover:shadow-md active:scale-95',
    secondary: 'border-2 border-accent text-accent hover:bg-accent hover:text-white hover:shadow-sm active:scale-95',
    ghost: 'text-foreground hover:bg-[var(--hover-bg)]',
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  const content = (
    <>
      {children}
      {showArrow && <ArrowRightIcon width={16} height={16} />}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  )
}
