import { createClient } from '@/lib/supabase/server'
import { ReviewQueue } from '@/components/review-queue'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: dueReviews } = await supabase
    .from('reviews')
    .select('*, problem:problems(*)')
    .eq('user_id', user.id)
    .lte('due_date', today)
    .order('due_date', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Today's Review</h1>
        <p className="text-muted-foreground mt-1">
          {dueReviews?.length
            ? `${dueReviews.length} problems due`
            : 'Nothing to review today ✓'}
        </p>
      </div>
      <ReviewQueue reviews={dueReviews ?? []} />
    </div>
  )
}
