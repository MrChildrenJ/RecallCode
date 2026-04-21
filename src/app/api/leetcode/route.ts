import { NextRequest, NextResponse } from 'next/server'

const DIFFICULTY_MAP: Record<string, 'easy' | 'medium' | 'hard'> = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
}

async function gql(query: string) {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  return res.json()
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    // Step 1: get titleSlug from problem list search
    const listJson = await gql(`
      query {
        problemsetQuestionList: questionList(
          categorySlug: ""
          filters: { searchKeywords: "${id}" }
        ) {
          questions: data {
            frontendQuestionId: questionFrontendId
            titleSlug
          }
        }
      }
    `)

    const questions = listJson?.data?.problemsetQuestionList?.questions ?? []
    const match = questions.find(
      (q: { frontendQuestionId: string }) => q.frontendQuestionId === String(id)
    )
    if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Step 2: get full details including topicTags
    const detailJson = await gql(`
      query {
        question(titleSlug: "${match.titleSlug}") {
          title
          difficulty
          topicTags { slug }
        }
      }
    `)

    const q = detailJson?.data?.question
    if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      title: q.title,
      difficulty: DIFFICULTY_MAP[q.difficulty] ?? 'medium',
      url: `https://leetcode.com/problems/${match.titleSlug}/`,
      tags: (q.topicTags as { slug: string }[]).map((t) => t.slug),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
