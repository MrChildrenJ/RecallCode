'use client'

import { useState } from 'react'
import { Review, Rating, ErrorType } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { submitReview } from '@/app/actions/reviews'

const ERROR_TYPES: { value: ErrorType; label: string }[] = [
  { value: 'no_idea', label: 'No idea' },
  { value: 'cant_code', label: "Know but can't code" },
  { value: 'bug', label: 'Implementation bug' },
  { value: 'edge_case', label: 'Missed edge case' },
  { value: 'too_slow', label: 'Wrong complexity' },
  { value: 'none', label: 'No issues' },
]

const RATINGS: { value: Rating; label: string; desc: string; color: string }[] = [
  { value: 'again', label: 'Again', desc: 'Blank', color: 'border-red-300 hover:bg-red-50' },
  { value: 'hard', label: 'Hard', desc: 'Struggled', color: 'border-orange-300 hover:bg-orange-50' },
  { value: 'good', label: 'Good', desc: 'Recalled', color: 'border-blue-300 hover:bg-blue-50' },
  { value: 'easy', label: 'Easy', desc: 'Easy', color: 'border-green-300 hover:bg-green-50' },
]

interface Props {
  review: Review
  onComplete: (reviewId: string) => void
  onClose: () => void
}

export function ReviewModal({ review, onComplete, onClose }: Props) {
  const [step, setStep] = useState<'think' | 'rate'>('think')
  const [errorType, setErrorType] = useState<ErrorType>('none')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const problem = review.problem!

  async function handleRate(rating: Rating) {
    setLoading(true)
    const result = await submitReview({
      reviewId: review.id,
      problemId: review.problem_id,
      rating,
      errorType,
      note,
      currentInterval: review.interval,
      currentEaseFactor: review.ease_factor,
    })
    setLoading(false)

    if (result.error) {
      toast.error('Failed to save, please try again')
      return
    }
    toast.success('Review recorded')
    onComplete(review.id)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-sm">
              #{problem.leetcode_id}
            </span>
            {problem.title}
          </DialogTitle>
        </DialogHeader>

        {step === 'think' && (
          <div className="space-y-5">
            <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Recall the approach</p>
              <p>Don't look at the solution yet. Try to recall the algorithm, time complexity, and edge cases.</p>
            </div>

            <div>
              <Label className="mb-2 block">How did it go?</Label>
              <div className="grid grid-cols-2 gap-2">
                {ERROR_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setErrorType(value)}
                    className={`text-sm px-3 py-2 rounded-md border transition-colors text-left ${
                      errorType === value
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="note" className="mb-2 block">
                Notes (optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Jot down your approach, no need to write code..."
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <Button className="w-full" onClick={() => setStep('rate')}>
              Done, rate it
            </Button>
          </div>
        )}

        {step === 'rate' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Be honest about how it went:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {RATINGS.map(({ value, label, desc, color }) => (
                <button
                  key={value}
                  disabled={loading}
                  onClick={() => handleRate(value)}
                  className={`border-2 rounded-lg p-3 text-left transition-colors disabled:opacity-50 ${color}`}
                >
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep('think')}>
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
