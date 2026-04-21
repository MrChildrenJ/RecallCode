'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateNextReview } from '@/lib/srs'
import { Rating, ErrorType } from '@/types'
import { revalidatePath } from 'next/cache'

interface SubmitReviewParams {
  reviewId: string
  problemId: string
  rating: Rating
  errorType: ErrorType
  note: string
  currentInterval: number
  currentEaseFactor: number
}

export async function submitReview(params: SubmitReviewParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { reviewId, problemId, rating, errorType, note, currentInterval, currentEaseFactor } = params

  const next = calculateNextReview(rating, {
    easeFactor: currentEaseFactor,
    interval: currentInterval,
    status: 'learning',
  })

  const { error: updateError } = await supabase
    .from('reviews')
    .update({
      ease_factor: next.easeFactor,
      interval: next.interval,
      due_date: next.dueDate.toISOString().split('T')[0],
      status: next.status,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (updateError) return { error: updateError.message }

  await supabase.from('review_logs').insert({
    review_id: reviewId,
    problem_id: problemId,
    user_id: user.id,
    rating,
    error_type: errorType,
    note,
  })

  revalidatePath('/')
  return { success: true }
}
