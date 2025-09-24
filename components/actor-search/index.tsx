'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { type Actor } from '@/types/tmdb'
import { useDebounce } from '@/hooks/use-debounce'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { AspectRatio } from '@/components/ui/aspect-ratio'

interface ActorSearchProps {
  actorNumber: number
  selectedActor: Actor | null
  onSelectActor: (actor: Actor | null) => void
  disabledActors: Actor[]
}

export function ActorSearch({
  actorNumber,
  selectedActor,
  onSelectActor,
  disabledActors,
}: ActorSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [searchResults, setSearchResults] = useState<Actor[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/person?query=${query}`)
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Failed to search for actors:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    handleSearch(debouncedSearchTerm)
  }, [debouncedSearchTerm, handleSearch])

  const handleSelect = (actor: Actor) => {
    onSelectActor(actor)
    setOpen(false)
    setSearchTerm('')
    setSearchResults([])
  }

  const handleClear = () => {
    onSelectActor(null)
  }

  return (
    <div className="relative w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-sm">
      <div
        className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
        {actorNumber}
      </div>

      <AspectRatio ratio={3 / 4} className="relative">
        {selectedActor ? (
          <>
            <Image
              src={`https://image.tmdb.org/t/p/w500${selectedActor.profile_path}`}
              alt={selectedActor.name}
              fill
              className="rounded-t-lg object-cover"
            />
            <div
              className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-black/80 to-transparent"/>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold">{selectedActor.name}</h3>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-t-lg bg-muted"/>
        )}
      </AspectRatio>

      <div className="p-4">
        {selectedActor ? (
          <Button variant="outline" onClick={handleClear} className="w-full">
            Clear
          </Button>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {'Select actor...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder="Search for an actor..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
                  {!isLoading && !searchResults.length && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
                  <CommandGroup>
                    {searchResults.map((actor) => (
                      <CommandItem
                        key={actor.id}
                        value={actor.name}
                        onSelect={() => handleSelect(actor)}
                        disabled={disabledActors.some((a) => a.id === actor.id)}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                            alt={actor.name}
                          />
                          <AvatarFallback>
                            {actor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{actor.name}</span>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            false ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
