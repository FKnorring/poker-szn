"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Game, Player, Score } from "@prisma/client";
import { useState } from "react";
import { EditGameProvider, useEditGame } from "./context";
import { getNonAssignedPlayers, getPlayerScores } from "./utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { handleAddPlayerToGame } from "./api";

type ExtendedGame = Game & { players: Player[] } & { scores: Score[] };

interface GamesProps {
  games: ExtendedGame[];
  players: Player[];
}

function GameDetails({ game }: { game: ExtendedGame }) {
  const { players } = useEditGame();
  const nonAssignedPlayers = getNonAssignedPlayers(players, game.players);
  const scoredPlayers = getPlayerScores(game.scores, game.players);

  function handleAddPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const playerId = parseInt(formData.get("test") as string);
    handleAddPlayerToGame(game.id, playerId);
  }

  return (
    <div>
      <h2>Players</h2>
      <ul>
        {scoredPlayers.map((player) => (
          <li key={player.id}>
            {player.name} {player.score}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <form onSubmit={handleAddPlayer}>
          <Select name="test">
            <SelectTrigger>
              <SelectValue placeholder="Välj spelare" />
            </SelectTrigger>
            <SelectContent>
              {nonAssignedPlayers.map((player) => (
                <SelectItem key={player.id} value={player.id.toString()}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="flex gap-1">
            Lägg till <Plus size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function Games({ games, players }: GamesProps) {
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  function selectGame(gameId: string) {
    setSelectedGame(parseInt(gameId));
  }

  function findGame(id: number) {
    return games.find((game) => game.id === id);
  }

  const game = selectedGame ? findGame(selectedGame) : null;

  return (
    <EditGameProvider values={{ players }}>
      <div>
        <Select onValueChange={selectGame}>
          <SelectTrigger>
            <SelectValue placeholder="Välj en match" />
          </SelectTrigger>
          <SelectContent>
            {games.map((game) => (
              <SelectItem key={game.id} value={game.id.toString()}>
                {new Date(game.date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {game && <GameDetails game={game} />}
      </div>
    </EditGameProvider>
  );
}
