import { Button } from '@/components/ui/Button'
import { HomeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-5xl font-serif mb-6 text-foreground">404</h1>
        <p className="text-lg text-muted mb-8 leading-relaxed">
          The shop you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button href="/shops" variant="primary" className="inline-flex items-center gap-2">
            <ShoppingBagIcon width={16} height={16} />
            View All Shops
          </Button>
          <Button href="/" variant="secondary" className="inline-flex items-center gap-2">
            <HomeIcon width={16} height={16} />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

