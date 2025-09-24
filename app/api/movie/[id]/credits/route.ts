import { getMovieCredits } from '@/services/tmdb'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  // URL path is like /api/movie/123/credits, so we need the third-to-last segment
  const pathSegments = url.pathname.split('/')
  const idParam = pathSegments[pathSegments.length - 2]
  const id = Number.parseInt(idParam)

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const data = await getMovieCredits(id)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data from TMDB' },
      { status: 500 },
    )
  }
}
