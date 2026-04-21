'use client'

import { useState } from 'react'
import { Problem, Review, ReviewLog, ProblemStatus, Difficulty } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateReviewStatus, updateProblemUrl, updateProblemMeta } from '@/app/actions/problems'
import { CodeEditor } from '@/components/code-editor'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const difficultyColor: Record<Difficulty, string> = {
  easy: 'text-green-700 bg-green-50',
  medium: 'text-yellow-700 bg-yellow-50',
  hard: 'text-red-700 bg-red-50',
}

const difficultyActiveBg: Record<Difficulty, string> = {
  easy: 'bg-green-100 border-green-400 text-green-800',
  medium: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  hard: 'bg-red-100 border-red-400 text-red-800',
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const STATUSES: { value: ProblemStatus; label: string }[] = [
  { value: 'learning', label: 'Learning' },
  { value: 'mastered', label: 'Mastered' },
]

const errorLabels: Record<string, string> = {
  no_idea: 'No idea',
  cant_code: "Can't code it",
  bug: 'Bug',
  edge_case: 'Edge case',
  too_slow: 'Wrong complexity',
  none: 'No issues',
}

const ratingColor: Record<string, string> = {
  again: 'text-red-600',
  hard: 'text-orange-600',
  good: 'text-blue-600',
  easy: 'text-green-600',
}

interface Props {
  problem: Problem
  review: Review | null
  logs: ReviewLog[]
}

export function ProblemDetail({ problem, review, logs }: Props) {
  const router = useRouter()

  const [status, setStatus] = useState<ProblemStatus>(review?.status ?? 'learning')
  const [savingStatus, setSavingStatus] = useState(false)

  const [url, setUrl] = useState(problem.leetcode_url ?? '')
  const [editingUrl, setEditingUrl] = useState(false)
  const [savingUrl, setSavingUrl] = useState(false)

  const [editingMeta, setEditingMeta] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>(problem.difficulty)
  const [tags, setTags] = useState<string[]>(problem.tags)
  const [customTag, setCustomTag] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setCustomTag('')
  }

  async function handleStatusChange(newStatus: ProblemStatus) {
    if (!review) return
    setSavingStatus(true)
    const result = await updateReviewStatus(review.id, newStatus)
    setSavingStatus(false)
    if (result.error) { toast.error('Failed to update'); return }
    setStatus(newStatus)
    toast.success('Status updated')
  }

  async function handleSaveUrl() {
    setSavingUrl(true)
    const result = await updateProblemUrl(problem.id, url)
    setSavingUrl(false)
    if (result.error) { toast.error('Failed to update'); return }
    setEditingUrl(false)
    toast.success('Link updated')
  }

  async function handleSaveMeta() {
    setSavingMeta(true)
    const result = await updateProblemMeta(problem.id, { difficulty, tags })
    setSavingMeta(false)
    if (result.error) { toast.error('Failed to update'); return }
    setEditingMeta(false)
    toast.success('Updated')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
        >
          ← Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground font-mono text-sm">#{problem.leetcode_id}</p>
            <h1 className="text-2xl font-bold mt-1">{problem.title}</h1>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {url && !editingUrl && (
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
              >
                Open problem ↗
              </Link>
            )}
            {editingUrl ? (
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-64 text-sm"
                  autoFocus
                />
                <Button size="sm" disabled={savingUrl} onClick={handleSaveUrl}>
                  {savingUrl ? '...' : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingUrl(false); setUrl(problem.leetcode_url ?? '') }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setEditingUrl(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {url ? 'Edit link' : '+ Add link'}
              </button>
            )}
          </div>
        </div>

        {editingMeta ? (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                    difficulty === d ? difficultyActiveBg[d] : 'border-border hover:bg-muted'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full cursor-pointer"
                >
                  {tag} ×
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={customTag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTag(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  e.key === 'Enter' && (e.preventDefault(), addCustomTag())
                }
                className="text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomTag}>Add</Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={savingMeta} onClick={handleSaveMeta}>
                {savingMeta ? '...' : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setEditingMeta(false)
                setDifficulty(problem.difficulty)
                setTags(problem.tags)
              }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[difficulty]}`}>
              {difficulty}
            </span>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            <button
              onClick={() => setEditingMeta(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="border rounded-lg p-5 space-y-3">
        <h2 className="font-semibold">Status</h2>
        <div className="flex gap-2">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              disabled={savingStatus}
              onClick={() => handleStatusChange(value)}
              className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 ${
                status === value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {review && (
          <p className="text-xs text-muted-foreground">
            Next review: {review.due_date}
            {review.last_reviewed_at && (
              <> · Last: {new Date(review.last_reviewed_at).toLocaleDateString('en-US')}</>
            )}
          </p>
        )}
      </div>

      <div className="border rounded-lg p-5">
        <CodeEditor problemId={problem.id} initialCode={problem.solution_code} />
      </div>

      <div>
        <h2 className="font-semibold mb-3">Review History</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No review history</p>
        ) : (
          <div className="divide-y border rounded-lg">
            {logs.map((log) => (
              <div key={log.id} className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${ratingColor[log.rating]}`}>
                    {log.rating.charAt(0).toUpperCase() + log.rating.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.reviewed_at).toLocaleDateString('en-US')}
                  </span>
                </div>
                {log.error_type !== 'none' && (
                  <p className="text-xs text-muted-foreground">
                    Issue: {errorLabels[log.error_type]}
                  </p>
                )}
                {log.note && (
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{log.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
