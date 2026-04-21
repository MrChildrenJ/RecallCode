import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProblemDetail } from '@/components/problem-detail'

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: problem } = await supabase
    .from('problems')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!problem) notFound()

  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('problem_id', id)
    .eq('user_id', user.id)
    .single()

  const { data: logs } = await supabase
    .from('review_logs')
    .select('*')
    .eq('problem_id', id)
    .eq('user_id', user.id)
    .order('reviewed_at', { ascending: false })
    .limit(20)

  return <ProblemDetail problem={problem} review={review} logs={logs ?? []} />
}
