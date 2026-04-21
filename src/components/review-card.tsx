'use client'

import { Review } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const difficultyColor = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
}

interface Props {
  review: Review
  onReview: () => void
}

export function ReviewCard({ review, onReview }: Props) {
  const problem = review.problem!
  const isOverdue =
    new Date(review.due_date) < new Date(new Date().toDateString())

  return (
    <div className="p-4 flex items-center justify-between gap-4 rounded-xl ring-1 ring-foreground/10 bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-muted-foreground text-sm font-mono w-12 shrink-0">
          #{problem.leetcode_id}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate">{problem.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[problem.difficulty]}`}
            >
              {problem.difficulty}
            </span>
            {problem.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {isOverdue && (
              <span className="text-xs text-red-500">Overdue</span>
            )}
          </div>
        </div>
      </div>
      <Button size="sm" onClick={onReview} className="shrink-0">
        Review
      </Button>
    </div>
  )
}
