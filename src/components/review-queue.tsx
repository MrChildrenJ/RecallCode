'use client'

import { useState } from 'react'
import { Review } from '@/types'
import { ReviewCard } from './review-card'
import { ReviewModal } from './review-modal'
import Link from 'next/link'

interface Props {
  reviews: Review[]
}

export function ReviewQueue({ reviews }: Props) {
  const [queue, setQueue] = useState(reviews)
  const [current, setCurrent] = useState<Review | null>(null)
  const [done, setDone] = useState<string[]>([])

  const pending = queue.filter((r) => !done.includes(r.id))

  function handleComplete(reviewId: string) {
    setDone((prev) => [...prev, reviewId])
    setCurrent(null)
  }

  if (pending.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-4xl mb-4">✓</p>
        <p className="text-lg font-medium">All done</p>
        <p className="text-sm mt-2">Great work today!</p>
        <Link
          href="/problems/add"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Add Problem
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3">
        {pending.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onReview={() => setCurrent(review)}
          />
        ))}
      </div>

      {current && (
        <ReviewModal
          review={current}
          onComplete={handleComplete}
          onClose={() => setCurrent(null)}
        />
      )}
    </>
  )
}
