'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Check your email for a confirmation link')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error('Invalid email or password'); setLoading(false); return }
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">RecallCode</h1>
          <p className="text-muted-foreground mt-2 text-sm">LeetCode 間隔複習工具</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="ml-1 text-primary hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
