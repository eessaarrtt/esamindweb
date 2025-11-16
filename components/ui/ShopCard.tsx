import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Badge } from './Badge'

type ShopCardProps = {
  name: string
  description: string
  categories: string[]
  href: string
  imageUrl?: string
}

export function ShopCard({ name, description, categories, href, imageUrl }: ShopCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="bg-card border border-card-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent hover:-translate-y-1">
        {imageUrl && (
          <div className="relative w-full h-48 overflow-hidden bg-card-border">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-card/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <Badge key={category} variant="accent" size="sm">
                {category}
              </Badge>
            ))}
          </div>
          <h3 className="text-xl font-serif text-foreground mb-2 group-hover:text-accent transition-colors duration-200">
            {name}
          </h3>
          <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-4">
            {description}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all duration-200">
            Learn more
            <ArrowRightIcon width={16} height={16} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}

