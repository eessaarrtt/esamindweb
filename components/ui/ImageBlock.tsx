import Image from 'next/image'
import { type ReactNode } from 'react'

type ImageBlockProps = {
  imageUrl: string
  alt: string
  title?: string
  description?: string
  children?: ReactNode
  imagePosition?: 'left' | 'right'
  className?: string
}

export function ImageBlock({
  imageUrl,
  alt,
  title,
  description,
  children,
  imagePosition = 'left',
  className = '',
}: ImageBlockProps) {
  const imageSection = (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
      />
    </div>
  )

  const contentSection = (
    <div className="space-y-4">
      {title && (
        <h3 className="text-2xl md:text-3xl font-serif text-foreground">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-lg text-muted leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  )

  return (
    <div className={`grid md:grid-cols-2 gap-8 items-center ${className}`}>
      {imagePosition === 'left' ? (
        <>
          {imageSection}
          {contentSection}
        </>
      ) : (
        <>
          {contentSection}
          {imageSection}
        </>
      )}
    </div>
  )
}

