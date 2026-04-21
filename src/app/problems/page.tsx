import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProblemsTable } from '@/components/problems-table'

export default async function ProblemsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: problems } = await supabase
    .from('problems')
    .select('*, review:reviews(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Problems</h1>
          <p className="text-muted-foreground mt-1">{problems?.length ?? 0} problems</p>
        </div>
        <Link
          href="/problems/add"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          + Add Problem
        </Link>
      </div>
      <ProblemsTable problems={problems ?? []} />
    </div>
  )
}
