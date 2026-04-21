'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { addProblem } from '@/app/actions/problems'
import { Difficulty } from '@/types'
import { CodeEditor } from '@/components/code-editor'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const COMMON_TAGS = [
  'array', 'backtracking', 'binary-search', 'bit-manipulation', 'breadth-first-search',
  'depth-first-search', 'dynamic-programming', 'graph', 'greedy', 'hash-table',
  'heap', 'linked-list', 'math', 'matrix', 'sliding-window',
  'sorting', 'stack', 'string', 'tree', 'two-pointers',
]

export function AddProblemForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [leetcodeId, setLeetcodeId] = useState('')
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [leetcodeUrl, setLeetcodeUrl] = useState('')
  const [solutionCode, setSolutionCode] = useState('')
  const [fetching, setFetching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const id = parseInt(leetcodeId)
    if (!id) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setFetching(true)
      try {
        const res = await fetch(`/api/leetcode?id=${id}`)
        if (res.ok) {
          const data = await res.json()
          setTitle(data.title)
          setDifficulty(data.difficulty)
          if (!leetcodeUrl) setLeetcodeUrl(data.url)
          if (data.tags?.length) setTags(data.tags)
        }
      } finally {
        setFetching(false)
      }
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [leetcodeId])

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t])
    }
    setCustomTag('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const id = parseInt(leetcodeId)
    if (!id || !title.trim()) {
      toast.error('Please enter a problem number and title')
      return
    }

    setLoading(true)
    const result = await addProblem({
      leetcodeId: id,
      title: title.trim(),
      difficulty,
      tags,
      leetcodeUrl: leetcodeUrl.trim() || undefined,
      solutionCode: solutionCode.trim() || undefined,
    })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Problem added')
    router.push('/problems')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leetcode-id">Problem #</Label>
          <Input
            id="leetcode-id"
            type="number"
            placeholder="e.g. 1"
            value={leetcodeId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLeetcodeId(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Difficulty</Label>
          <div className="flex gap-2 mt-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                  difficulty === d
                    ? d === 'easy'
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : d === 'medium'
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                      : 'bg-red-100 border-red-400 text-red-800'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Title</Label>
          {fetching && <span className="text-xs text-muted-foreground">Looking up...</span>}
        </div>
        <Input
          id="title"
          placeholder="e.g. Two Sum"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="leetcode-url">LeetCode URL (optional)</Label>
        <Input
          id="leetcode-url"
          type="url"
          placeholder="https://leetcode.com/problems/two-sum/"
          value={leetcodeUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLeetcodeUrl(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label>Tag</Label>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {COMMON_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                tags.includes(tag)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Custom tag"
            value={customTag}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTag(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
            className="text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustomTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag} ×
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Solution (optional)</Label>
        <CodeEditor value={solutionCode} onChange={setSolutionCode} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Loading...' : 'Add Problem'}
      </Button>
    </form>
  )
}
