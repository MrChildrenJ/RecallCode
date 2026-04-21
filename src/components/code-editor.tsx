'use client'

import { useState, useCallback } from 'react'
import SimpleCodeEditor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/themes/prism-tomorrow.css'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateSolutionCode } from '@/app/actions/problems'

const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c'] as const
type Language = typeof LANGUAGES[number]

const LANG_LABEL: Record<Language, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
}

interface Props {
  problemId?: string
  initialCode?: string | null
  value?: string
  onChange?: (code: string) => void
}

export function CodeEditor({ problemId, initialCode, value, onChange }: Props) {
  const controlled = onChange !== undefined
  const [internalCode, setInternalCode] = useState(initialCode ?? '')
  const [lang, setLang] = useState<Language>('python')
  const [editing, setEditing] = useState(controlled)
  const [saving, setSaving] = useState(false)

  const code = controlled ? (value ?? '') : internalCode
  const setCode = controlled ? onChange : setInternalCode

  const highlight = useCallback(
    (v: string) => Prism.highlight(v, Prism.languages[lang] ?? Prism.languages.plain, lang),
    [lang]
  )

  async function handleSave() {
    if (!problemId) return
    setSaving(true)
    const result = await updateSolutionCode(problemId, code)
    setSaving(false)
    if (result.error) { toast.error('Failed to save'); return }
    toast.success('Solution saved')
    setEditing(false)
  }

  const langSelector = (
    <div className="flex gap-1">
      {LANGUAGES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`text-xs px-2 py-1 rounded border transition-colors ${
            lang === l ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {!controlled && <h2 className="font-semibold">My Solution</h2>}
        <div className="flex items-center gap-2 ml-auto">
          {langSelector}
          {!controlled && (
            editing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? '...' : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setInternalCode(initialCode ?? ''); setEditing(false) }}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                {code ? 'Edit' : '+ Add solution'}
              </Button>
            )
          )}
        </div>
      </div>

      {(editing || code || controlled) ? (
        <div className={`rounded-lg border overflow-hidden text-sm ${editing || controlled ? 'ring-2 ring-primary/30' : ''}`}>
          <SimpleCodeEditor
            value={code}
            onValueChange={setCode}
            highlight={highlight}
            readOnly={!editing && !controlled}
            padding={16}
            style={{
              fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Menlo, Monaco, monospace',
              fontSize: 13,
              background: '#2d2d2d',
              color: '#ccc',
              minHeight: (editing || controlled) ? 200 : undefined,
            }}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No solution recorded</p>
      )}
    </div>
  )
}
