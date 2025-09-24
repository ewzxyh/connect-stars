"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { popularActors } from "@/lib/popular-actors";
import { cn } from "@/lib/utils";
import type { Actor, SearchPersonResponse } from "@/types/tmdb";

interface ActorSearchProps {
  actorNumber: number;
  selectedActor: Actor | null;
  onSelectActor: (actor: Actor | null) => void;
  disabledActors?: (Actor | null)[];
}

export function ActorSearch({
  actorNumber,
  selectedActor,
  onSelectActor,
  disabledActors = [],
}: ActorSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([] as Actor[]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/person?query=${query}`);
      const data: SearchPersonResponse = await response.json();
      setSearchResults(data.results || [] as Actor[]);
    } catch (error) {
      console.error("Failed to search for actors:", error);
      setSearchResults([] as Actor[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);

  const handleSelect = (actor: Actor) => {
    onSelectActor(actor);
    setOpen(false);
    setSearchTerm("");
    setSearchResults([] as Actor[]);
  };

  const handleClear = () => {
    onSelectActor(null);
  };

  const handleChooseForMe = async () => {
    const availableActors = popularActors.filter(
      (actor) =>
        !disabledActors.some(
          (disabled) => disabled && disabled.id === actor.id,
        ),
    );
    const randomActorData =
      availableActors[Math.floor(Math.random() * availableActors.length)];

    if (randomActorData) {
      try {
        const response = await fetch(`/api/person/${randomActorData.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch actor details");
        }
        const actorDetails: Actor = await response.json();
        onSelectActor(actorDetails);
      } catch (error) {
        console.error("Failed to fetch random actor details:", error);
        // Fallback to basic info if API fails
        onSelectActor({
          id: randomActorData.id,
          name: randomActorData.name,
          profile_path: randomActorData.profile_path,
          popularity: 0,
        });
      }
    }
  };

  return (
    <Card className="relative w-[340px] overflow-hidden rounded-xl pt-0">
      <CardHeader className="p-0">
        <div className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
          {actorNumber}
        </div>
        <div className="relative h-[440px] w-[340px]">
          {selectedActor ? (
            <>
              <Image
                src={`https://image.tmdb.org/t/p/w500${selectedActor.profile_path}`}
                alt={selectedActor.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold">{selectedActor.name}</h3>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted" />
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {selectedActor ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleChooseForMe}
              className="w-full"
            >
              Choose another
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              className="w-full"
            >
              Clear
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {"Select actor..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                      {searchResults.map((actor: Actor) => (
                        <CommandItem
                          key={actor.id}
                          value={actor.name}
                          onSelect={() => handleSelect(actor)}
                          disabled={disabledActors.some(
                            (a) => a?.id === actor.id,
                          )}
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
                              "ml-auto h-4 w-4",
                              selectedActor?.id === actor.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleChooseForMe}>
              Choose for me
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
