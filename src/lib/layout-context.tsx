'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type LayoutWidth = 'default' | 'wide'

interface LayoutContextValue {
  width: LayoutWidth
  toggle: () => void
}

const LayoutContext = createContext<LayoutContextValue>({
  width: 'default',
  toggle: () => {},
})

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<LayoutWidth>('default')

  useEffect(() => {
    const saved = localStorage.getItem('layout-width') as LayoutWidth | null
    if (saved) setWidth(saved)
  }, [])

  function toggle() {
    setWidth((prev) => {
      const next = prev === 'default' ? 'wide' : 'default'
      localStorage.setItem('layout-width', next)
      return next
    })
  }

  return (
    <LayoutContext.Provider value={{ width, toggle }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  return useContext(LayoutContext)
}
