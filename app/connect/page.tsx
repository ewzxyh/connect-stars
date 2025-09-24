'use client'

import { MovieGraph, type MovieGraphRef } from '@/components/movie-graph'
import {
  type Actor,
  type MultiSearchResult,
} from '@/types/tmdb'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { GameSearch } from '@/components/game-search'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ConnectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [actor1, setActor1] = useState<Actor | null>(null)
  const [actor2, setActor2] = useState<Actor | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectedActorIds, setConnectedActorIds] = useState(new Set<string>())
  const [path, setPath] = useState<string[]>([])
  const { toast } = useToast()
  const graphRef = useRef<MovieGraphRef>(null)

  useEffect(() => {
    const actor1Id = searchParams.get('actor1')
    const actor2Id = searchParams.get('actor2')

    if (!actor1Id || !actor2Id) {
      router.push('/')
      return
    }

    setConnectedActorIds(new Set([actor1Id, actor2Id]))

    const fetchActors = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/person/${actor1Id}`),
          fetch(`/api/person/${actor2Id}`),
        ])

        if (res1.ok && res2.ok) {
          const actor1Data = await res1.json()
          const actor2Data = await res2.json()
          setActor1(actor1Data)
          setActor2(actor2Data)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to fetch initial actors', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchActors()
  }, [searchParams, router])

  const handleSelect = async (item: MultiSearchResult) => {
    if (item.media_type !== 'movie') return

    try {
      const res = await fetch(`/api/movie/${item.id}/credits`)
      const movieCredits: { cast: Actor[] } = await res.json()
      const castIds = new Set(
        movieCredits.cast.map((actor) => actor.id.toString()),
      )

      const intersection = new Set(
        [...castIds].filter((id) => connectedActorIds.has(id)),
      )

      if (intersection.size === 0) {
        toast({
          variant: 'destructive',
          title: 'No connection found',
          description:
            "This movie doesn't feature any actors currently on your board.",
        })
        return
      }

      const newMovieElement: cytoscape.ElementDefinition = {
        data: {
          id: `movie-${item.id}`,
          label: item.title ?? 'Untitled Movie',
          type: 'movie',
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : undefined,
        },
      }

      const newEdges: cytoscape.ElementDefinition[] = []

      intersection.forEach((actorId) => {
        newEdges.push({
          data: {
            source: actorId,
            target: `movie-${item.id}`,
          },
        })
      })

      graphRef.current?.addElements([newMovieElement, ...newEdges])
    } catch (error) {
      console.error('Failed to process movie selection', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch movie credits.',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!actor1 || !actor2) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Could not load actors. Redirecting home...
      </div>
    )
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <header className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Connect <span className="text-primary">{actor1.name}</span> and{' '}
            <span className="text-primary">{actor2.name}</span>
          </h1>
          {path.length > 0 && (
            <p className="text-muted-foreground">
              Best path: {Math.floor(path.length / 2)} connections
            </p>
          )}
        </div>
      </header>

      <MovieGraph
        ref={graphRef}
        actor1={actor1}
        actor2={actor2}
        onPathFound={setPath}
      />

      <footer className="absolute bottom-4 left-1/2 z-10 w-full max-w-md -translate-x-1/2 px-4">
        <GameSearch
          onSelect={handleSelect}
          connectedActorIds={connectedActorIds}
        />
      </footer>
    </main>
  )
}