'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/', label: "Today's Review" },
  { href: '/problems', label: 'Problems' },
  { href: '/stats', label: 'Stats' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg tracking-tight">
          RecallCode
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-2"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
