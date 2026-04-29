import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddProblemForm } from '@/components/add-problem-form'
import { Container } from '@/components/container'

export default async function AddProblemPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <Container className="max-w-xl">
      <h1 className="text-2xl font-bold mb-8">Add Problem</h1>
      <AddProblemForm />
    </Container>
  )
}
