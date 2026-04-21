import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddProblemForm } from '@/components/add-problem-form'

export default async function AddProblemPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Add Problem</h1>
      <AddProblemForm />
    </div>
  )
}
