'use client'

import { useLayout } from '@/lib/layout-context'

interface Props {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className = '' }: Props) {
  const { width } = useLayout()

  return (
    <div
      className={`mx-auto px-4 py-8 transition-all duration-300 ${
        width === 'wide' ? 'w-[90%]' : 'max-w-4xl'
      } ${className}`}
    >
      {children}
    </div>
  )
}
