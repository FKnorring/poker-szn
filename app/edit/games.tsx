"use client";
import { Game, Player, Score } from "@prisma/client";
import { useOptimistic, useRef, useState } from "react";
import { EditGameProvider, useEditGame } from "./context";
import { getNonAssignedPlayers, getPlayerScores } from "./utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
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
import { toast } from "sonner";

export type ExtendedGame = Game & { players: Player[] } & { scores: Score[] };

interface GamesProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function Games({ games, players }: GamesProps) {
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [_players, setPlayers] = useState(players);
  const [_games, setGames] = useState(games);

  function selectGame(gameId: number) {
    if (gameId === selectedGame) {
      setSelectedGame(null);
      return;
    }
    setSelectedGame(gameId);
  }

  async function handleAddNewGame(formData: FormData) {
    const date = formData.get("date") as string;
    if (!date) return;
    const game = await handleAddGame(date);
    setGames((games) => [...games, { ...game, players: [], scores: [] }]);
    toast("Matchen har lagts till!", {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  return (
    <EditGameProvider values={{ players, setPlayers }}>
      <div className="flex flex-col gap-2">
        <form className="flex gap-2" action={handleAddNewGame}>
          <DatePicker />
          <Button
            type="submit"
            className="flex items-center justify-center gap-1"
          >
            Lägg till match <Plus size={16} />
          </Button>
        </form>
        <div className="flex flex-col gap-2">
          {_games.map((game) => (
            <Collapsible
              key={game.id}
              className="border py-4 px-2 lg:px-6 rounded-md flex flex-col shadow-sm"
            >
              <CollapsibleTrigger
                role="button"
                onClick={() => selectGame(game.id)}
                className="w-full flex gap-2 justify-between items-center"
              >
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
