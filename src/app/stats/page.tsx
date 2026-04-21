import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: logs }, { data: reviews }, { data: problems }] = await Promise.all([
    supabase
      .from('review_logs')
      .select('rating, error_type, reviewed_at')
      .eq('user_id', user.id)
      .order('reviewed_at', { ascending: false })
      .limit(200),
    supabase
      .from('reviews')
      .select('status')
      .eq('user_id', user.id),
    supabase
      .from('problems')
      .select('difficulty, tags')
      .eq('user_id', user.id),
  ])

  const totalLogs = logs?.length ?? 0
  const retained = logs?.filter((l) => l.rating !== 'again').length ?? 0
  const retentionRate = totalLogs > 0 ? Math.round((retained / totalLogs) * 100) : 0

  const statusCount = { learning: 0, mastered: 0 }
  reviews?.forEach((r) => {
    statusCount[r.status as keyof typeof statusCount]++
  })

  const errorCount: Record<string, number> = {}
  logs?.forEach((l) => {
    if (l.error_type !== 'none') {
      errorCount[l.error_type] = (errorCount[l.error_type] ?? 0) + 1
    }
  })

  const errorLabels: Record<string, string> = {
    no_idea: 'No idea',
    cant_code: "Can't code it",
    bug: 'Bug',
    edge_case: 'Edge case',
    too_slow: 'Wrong complexity',
  }

  const today = new Date().toISOString().split('T')[0]
  const todayReviews = logs?.filter((l) => l.reviewed_at.startsWith(today)).length ?? 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Stats</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: problems?.length ?? 0 },
          { label: 'Mastered', value: statusCount.mastered },
          { label: "Today's reviews", value: todayReviews },
          { label: 'Retention rate', value: `${retentionRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Progress</h2>
          <div className="space-y-2">
            {Object.entries({ learning: 'Learning', mastered: 'Mastered' }).map(
              ([key, label]) => {
                const count = statusCount[key as keyof typeof statusCount]
                const total = reviews?.length ?? 1
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="font-semibold mb-4">Common errors</h2>
          {Object.keys(errorCount).length === 0 ? (
            <p className="text-muted-foreground text-sm">No errors recorded</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(errorCount)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span>{errorLabels[type] ?? type}</span>
                    <span className="font-medium">{count}x</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
