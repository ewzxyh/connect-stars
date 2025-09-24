"use client";

import { Film, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import type { MultiSearchResult } from "@/types/tmdb";

interface GameSearchProps {
  onSelect: (item: MultiSearchResult) => void;
  connectedActorIds: Set<string>;
}

export function GameSearch({ onSelect, connectedActorIds }: GameSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<MultiSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search/multi?query=${query}`);
        const data = await response.json();
        const filteredResults = (data.results || []).filter(
          (item: MultiSearchResult) =>
            item.media_type === "movie" ||
            (item.media_type === "person" &&
              !connectedActorIds.has(item.id.toString())),
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Failed to search:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [connectedActorIds],
  );

  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);

  const handleSelect = (item: MultiSearchResult) => {
    onSelect(item);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <Command className="w-full max-w-md rounded-lg border shadow-md">
      <CommandInput
        placeholder="Name a movie or actor..."
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
        {!isLoading &&
          searchResults.length === 0 &&
          debouncedSearchTerm.length > 1 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
        <CommandGroup>
          {searchResults.map((item) => (
            <CommandItem
              key={`${item.media_type}-${item.id}`}
              value={item.name || item.title}
              onSelect={() => handleSelect(item)}
              className="flex items-center gap-2"
            >
              <Avatar className="h-8 w-8 rounded-sm">
                <AvatarImage
                  src={`https://image.tmdb.org/t/p/w200${
                    item.profile_path || item.poster_path
                  }`}
                  alt={item.name || item.title}
                />
                <AvatarFallback className="rounded-sm">
                  {item.media_type === "person" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Film className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <span>{item.name || item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
