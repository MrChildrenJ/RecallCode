export type Difficulty = 'easy' | 'medium' | 'hard'
export type ProblemStatus = 'learning' | 'mastered'
export type Rating = 'again' | 'hard' | 'good' | 'easy'
export type ErrorType =
  | 'no_idea'
  | 'cant_code'
  | 'bug'
  | 'edge_case'
  | 'too_slow'
  | 'none'

export interface Problem {
  id: string
  user_id: string
  leetcode_id: number
  title: string
  difficulty: Difficulty
  tags: string[]
  leetcode_url: string | null
  solution_code: string | null
  created_at: string
}

export interface Review {
  id: string
  problem_id: string
  user_id: string
  status: ProblemStatus
  ease_factor: number
  interval: number
  due_date: string
  last_reviewed_at: string | null
  problem?: Problem
}

export interface ReviewLog {
  id: string
  review_id: string
  problem_id: string
  user_id: string
  rating: Rating
  error_type: ErrorType
  note: string
  reviewed_at: string
}
