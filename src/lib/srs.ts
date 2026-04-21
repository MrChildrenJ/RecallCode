import { Rating } from '@/types'

interface ReviewState {
  easeFactor: number
  interval: number
  status: 'learning' | 'mastered'
}

interface NextReview {
  easeFactor: number
  interval: number
  status: 'learning' | 'mastered'
  dueDate: Date
}

export function calculateNextReview(
  rating: Rating,
  current: ReviewState
): NextReview {
  const { easeFactor: ef, interval } = current
  let newInterval: number
  let newEf = ef
  let newStatus: NextReview['status']

  switch (rating) {
    case 'again':
      newInterval = 1
      newEf = Math.max(1.3, ef - 0.2)
      newStatus = 'learning'
      break
    case 'hard':
      newInterval = Math.max(1, Math.round(interval * 1.2))
      newEf = Math.max(1.3, ef - 0.15)
      newStatus = 'learning'
      break
    case 'good':
      newInterval = interval <= 1 ? 3 : Math.round(interval * ef)
      newEf = ef
      newStatus = newInterval >= 21 ? 'mastered' : 'learning'
      break
    case 'easy':
      newInterval = interval <= 1 ? 7 : Math.round(interval * ef * 1.3)
      newEf = Math.min(4.0, ef + 0.1)
      newStatus = 'mastered'
      break
  }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + newInterval)

  return { easeFactor: newEf, interval: newInterval, status: newStatus, dueDate }
}

export function getInitialReview(): Omit<NextReview, 'dueDate'> & { dueDate: Date } {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 1)
  return {
    easeFactor: 2.5,
    interval: 1,
    status: 'learning',
    dueDate,
  }
}
