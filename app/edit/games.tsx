"use client";
import { Game, Player, Score } from "@prisma/client";
import { useOptimistic, useRef, useState } from "react";
import { EditGameProvider, useEditGame } from "./context";
import { getNonAssignedPlayers, getPlayerScores } from "./utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { handleAddGame, handleAddPlayerToGame } from "./api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";
import GameDetails from "./components/game-details";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ListGame from "./components/list-game";

export type ExtendedGame = Game & { players: Player[] } & { scores: Score[] };

interface GamesProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function Games({ games, players }: GamesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game");
  const [selectedGame, setSelectedGame] = useState<number | null>(
    gameId ? parseInt(gameId) : null
  );

  function selectGame(gameId: number) {
    if (gameId === selectedGame) {
      setSelectedGame(null);
      router.push(pathname);
      return;
    }
    setSelectedGame(gameId);
    router.push(`${pathname}?game=${gameId}`);
  }

  return (
    <EditGameProvider values={{ players }}>
      <div className="flex flex-col gap-2">
        <form
          className="flex gap-2"
          action={(formData) => {
            const date = formData.get("date") as string;
            if (!date) return;
            handleAddGame(date);
          }}
        >
          <DatePicker />
          <Button
            type="submit"
            className="flex items-center justify-center gap-1"
          >
            Lägg till match <Plus size={16} />
          </Button>
        </form>
        <div className="flex flex-col gap-2">
          {games.map((game) => (
            <Collapsible
              key={game.id}
              role="button"
              className="border py-4 px-6 rounded-md flex flex-col shadow-sm"
              onClick={() => selectGame(game.id)}
            >
              <CollapsibleTrigger className="w-full flex justify-between">
                <ListGame game={game} />
                {game.id === selectedGame ? <ChevronDown /> : <ChevronRight />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <GameDetails game={game} />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </EditGameProvider>
  );
}
