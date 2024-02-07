"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Game, Player, Score } from "@prisma/client";
import { useOptimistic, useRef, useState } from "react";
import { EditGameProvider, useEditGame } from "./context";
import { getNonAssignedPlayers, getPlayerScores } from "./utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { handleAddPlayerToGame } from "./api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { revalidatePath } from "next/cache";

type ExtendedGame = Game & { players: Player[] } & { scores: Score[] };

interface GamesProps {
  games: ExtendedGame[];
  players: Player[];
}

function GameDetails({ game }: { game: ExtendedGame }) {
  const { players } = useEditGame();
  const [gamePlayers, addGamePlayer] = useOptimistic(
    game.players,
    (state: Player[], player: Player) => [...state, player]
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const nonAssignedPlayers = getNonAssignedPlayers(players, gamePlayers);
  const scoredPlayers = getPlayerScores(game.scores, gamePlayers);

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
        <form
          ref={formRef}
          action={(formData) => {
            const playerId = parseInt(formData.get("player") as string);
            const player = players.find((player) => player.id === playerId);
            if (!player) return;
            addGamePlayer(player);
            handleAddPlayerToGame(game.id, playerId);
          }}
        >
          <Select
            onValueChange={() => {
              formRef.current?.requestSubmit();
            }}
            name="player"
          >
            <SelectTrigger>
              <SelectValue placeholder="Lägg till spelare" />
            </SelectTrigger>
            <SelectContent>
              {nonAssignedPlayers.map((player) => (
                <SelectItem key={player.id} value={player.id.toString()}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
      </div>
    </div>
  );
}

export default function Games({ games, players }: GamesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game");

  function selectGame(gameId: string) {
    router.push(`${pathname}?game=${gameId}`);
  }

  function findGame(id: string) {
    return games.find((game) => game.id === parseInt(id));
  }

  const game = gameId ? findGame(gameId) : null;

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
