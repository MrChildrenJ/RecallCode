'use server'

import { createClient } from '@/lib/supabase/server'
import { getInitialReview } from '@/lib/srs'
import { Difficulty } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface AddProblemParams {
  leetcodeId: number
  title: string
  difficulty: Difficulty
  tags: string[]
  leetcodeUrl?: string
  solutionCode?: string
}

export async function addProblem(params: AddProblemParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .insert({
      user_id: user.id,
      leetcode_id: params.leetcodeId,
      title: params.title,
      difficulty: params.difficulty,
      tags: params.tags,
      leetcode_url: params.leetcodeUrl || null,
      solution_code: params.solutionCode || null,
    })
    .select()
    .single()

  if (problemError) {
    if (problemError.code === '23505') return { error: 'Problem already exists' }
    return { error: problemError.message }
  }

  const initial = getInitialReview()
  await supabase.from('reviews').insert({
    problem_id: problem.id,
    user_id: user.id,
    ease_factor: initial.easeFactor,
    interval: initial.interval,
    due_date: initial.dueDate.toISOString().split('T')[0],
    status: initial.status,
  })

  revalidatePath('/problems')
  revalidatePath('/')
  return { success: true, problemId: problem.id }
}

export async function updateReviewStatus(reviewId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/problems')
  return { success: true }
}

export async function updateSolutionCode(problemId: string, code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('problems')
    .update({ solution_code: code || null })
    .eq('id', problemId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/problems/${problemId}`)
  return { success: true }
}

export async function updateProblemMeta(
  problemId: string,
  data: { difficulty: string; tags: string[] }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('problems')
    .update({ difficulty: data.difficulty, tags: data.tags })
    .eq('id', problemId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/problems/${problemId}`)
  return { success: true }
}

export async function updateProblemUrl(problemId: string, leetcodeUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('problems')
    .update({ leetcode_url: leetcodeUrl || null })
    .eq('id', problemId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/problems/${problemId}`)
  return { success: true }
}

export async function deleteProblem(problemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('problems')
    .delete()
    .eq('id', problemId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/problems')
  return { success: true }
}
