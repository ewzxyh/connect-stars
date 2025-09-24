"use client";

import { ActorSearch } from "@/components/actor-search";
import { Button } from "@/components/ui/button";
import { type Actor } from "@/types/tmdb";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export default function HomePage() {
  const [actor1, setActor1] = useState<Actor | null>(null);
  const [actor2, setActor2] = useState<Actor | null>(null);
  const router = useRouter();

  const handleStartGame = () => {
    if (actor1 && actor2) {
      router.push(`/connect?actor1=${actor1.id}&actor2=${actor2.id}`);
    }
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <header className="absolute top-4 right-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Play</DialogTitle>
              <DialogDescription>
                Figure out how two movie stars are connected through their
                films.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <h3 className="font-bold">The Goal</h3>
                <p>
                  Find the shortest path between two actors by connecting them
                  through the movies they've starred in together.
                </p>
              </div>
              <div>
                <h3 className="font-bold">Expand Your Board</h3>
                <p>
                  Type the names of movies or stars connected to the ones
                  already on your board to build new connections.
                </p>
              </div>
              <div>
                <h3 className="font-bold">Connect the Stars</h3>
                <p>Challenge yourself to find the shortest path possible!</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold">Connect the Stars</h1>
        <p className="mt-2 text-muted-foreground">
          Choose two movie stars to begin.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-12">
        <ActorSearch
          actorNumber={1}
          selectedActor={actor1}
          onSelectActor={setActor1}
          disabledActors={actor2 ? [actor2] : []}
        />
        <ActorSearch
          actorNumber={2}
          selectedActor={actor2}
          onSelectActor={setActor2}
          disabledActors={actor1 ? [actor1] : []}
        />
      </div>

      <div className="mt-12">
        <Button
          size="lg"
          disabled={!actor1 || !actor2}
          onClick={handleStartGame}
        >
          Connect
        </Button>
      </div>
    </main>
  );
}
