'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteProblem } from '@/app/actions/problems'
import { toast } from 'sonner'
import Link from 'next/link'

const difficultyColor = {
  easy: 'text-green-700 bg-green-50',
  medium: 'text-yellow-700 bg-yellow-50',
  hard: 'text-red-700 bg-red-50',
}

const statusLabel = {
  learning: 'Learning',
  mastered: 'Mastered',
}

interface Problem {
  id: string
  leetcode_id: number
  title: string
  difficulty: string
  tags: string[]
  review?: { status: string; due_date: string }[]
}

interface Props {
  problems: Problem[]
}

export function ProblemsTable({ problems }: Props) {
  const [search, setSearch] = useState('')
  const [filterDiff, setFilterDiff] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = problems.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      String(p.leetcode_id).includes(search)
    const matchDiff = filterDiff === 'all' || p.difficulty === filterDiff
    const status = p.review?.[0]?.status ?? 'learning'
    const matchStatus = filterStatus === 'all' || status === filterStatus
    return matchSearch && matchDiff && matchStatus
  })

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    const result = await deleteProblem(id)
    if (result.error) toast.error(result.error)
    else toast.success('Deleted')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by number or title..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {['all', 'easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                filterDiff === d ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {d === 'all' ? 'All' : d}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'learning', 'mastered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                filterStatus === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {s === 'all' ? 'All statuses' : statusLabel[s as keyof typeof statusLabel]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No problems found</p>
      ) : (
        <div className="divide-y border rounded-lg">
          {filtered.map((problem) => {
            const review = problem.review?.[0]
            const status = review?.status ?? 'learning'
            return (
              <div key={problem.id} className="flex items-center gap-4 px-4 py-3">
                <span className="text-muted-foreground font-mono text-sm w-12 shrink-0">
                  #{problem.leetcode_id}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/problems/${problem.id}`}
                    className="font-medium truncate hover:text-primary transition-colors block"
                  >
                    {problem.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        difficultyColor[problem.difficulty as keyof typeof difficultyColor]
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {statusLabel[status as keyof typeof statusLabel]}
                    </span>
                    {problem.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleDelete(problem.id, problem.title)}
                >
                  Delete
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
