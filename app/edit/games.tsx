"use client";
import { Game, Player, Score } from "@prisma/client";
import { useOptimistic, useRef, useState } from "react";
import { EditGameProvider, useEditGame } from "./context";
import { getNonAssignedPlayers, getPlayerScores, PlayerWithCount } from "./utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, X, Zap } from "lucide-react";
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
  players: PlayerWithCount[];
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
    const newGame = { ...game, players: [], scores: [] };
    setGames((games) => [
      newGame,
      ...games,
    ].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setSelectedGame(game.id);
    toast("Matchen har lagts till!", {
      description: new Date(date).toLocaleDateString("sv-SE"),
    });
  }

  async function handleQuickAddGame() {
    const today = new Date().toISOString().split('T')[0];
    const game = await handleAddGame(today);
    const newGame = { ...game, players: [], scores: [] };
    setGames((games) => [
      newGame,
      ...games,
    ].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setSelectedGame(game.id);
    toast("Matchen har lagts till!", {
      description: "Dagens datum: " + new Date().toLocaleDateString("sv-SE"),
    });
  }

  function handleGameRemoved(gameId: number) {
    setGames((games) => games.filter((game) => game.id !== gameId));
    if (selectedGame === gameId) {
      setSelectedGame(null);
    }
  }

  return (
    <EditGameProvider values={{ players: _players, setPlayers }}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            onClick={handleQuickAddGame}
            variant="secondary"
            className="flex items-center justify-center gap-1"
          >
            Snabbadda match <Zap size={16} />
          </Button>
          <form className="flex gap-2 flex-1" action={handleAddNewGame}>
            <DatePicker />
            <Button
              type="submit"
              className="flex items-center justify-center gap-1"
            >
              Lägg till match <Plus size={16} />
            </Button>
          </form>
        </div>
        <div className="flex flex-col gap-2 pb-10">
          {_games.map((game) => (
            <Collapsible
              key={game.id}
              className="border py-2 lg:py-4 px-2 lg:px-6 rounded-md flex flex-col shadow-sm"
              open={game.id === selectedGame}
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
                <GameDetails game={game} onGameRemoved={handleGameRemoved} />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </EditGameProvider>
  );
}
