'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/shops', label: 'Shops' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-[#111827] min-h-screen p-6">
      <h1 className="text-2xl font-serif text-[#f5e0c3] mb-8">ESAMIND</h1>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#f59e0b] text-[#050409]'
                  : 'text-[#f9fafb] hover:bg-[#1f2937]'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

