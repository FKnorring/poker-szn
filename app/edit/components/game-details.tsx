import { Game, Player, Score } from "@prisma/client";
import { TableProvider, useEditGame } from "../context";
import { useOptimistic, useRef, useState } from "react";
import { getGameMoney, getNonAssignedPlayers, getPlayerScores } from "../utils";
import {
  handleAddPlayerToGame,
  handleAddNewPlayerToGame,
  handleUpdateGameScores,
  handleRemovePlayerFromGame,
  handleRemoveGame,
} from "../api";
import { ExtendedGame } from "../games";
import AutoComplete from "./autocomplete";
import { Button } from "@/components/ui/button";
import { Plus, Save, SaveIcon, X } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { toast } from "sonner";
import Seating from "./seating";
import { Badge } from "@/components/ui/badge";

export default function GameDetails({ game }: { game: ExtendedGame }) {
  const { players } = useEditGame();
  const [gamePlayers, setGamePlayers] = useState(game.players);
  const [scoredPlayers, setScoredPlayers] = useState(
    getPlayerScores(game.scores, gamePlayers)
  );

  const { moneyIn, moneyOut } = getGameMoney(scoredPlayers);

  const nonAssignedPlayers = getNonAssignedPlayers(players, gamePlayers);

  function handleUpdatePlayer(
    id: number,
    buyins: number | undefined,
    stack: number | undefined
  ) {
    setScoredPlayers((players) =>
      players.map((player) => {
        if (player.id === id) {
          return {
            ...player,
            buyins: buyins ?? player.buyins,
            stack: stack ?? player.stack,
          };
        }
        return player;
      })
    );
  }

  async function handleAddPlayer(formData: FormData) {
    const name = formData.get("player") as string;
    if (!name) return;
    const player = players.find((player) => player.name === name);
    if (gamePlayers.some((p) => p.id === player?.id)) return;
    if (!player) {
      const { player } = await handleAddNewPlayerToGame(name, game.id);
      setGamePlayers((players) => [...players, player]);
      setScoredPlayers((players) => [
        ...players,
        { ...player, buyins: 1, stack: 100 },
      ]);
      return toast(`Ny spelare ${name} har lagts till i matchen!`, {
        description: new Date().toLocaleTimeString("sv-SE"),
      });
    }
    await handleAddPlayerToGame(player.id, game.id);
    setGamePlayers((players) => [...players, player]);
    setScoredPlayers((players) => [
      ...players,
      { ...player, buyins: 1, stack: 100 },
    ]);
    toast(`${name} har lagts till i matchen!`, {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  async function handleRemovePlayer(formData: FormData) {
    const playerId = parseInt(formData.get("playerId") as string);
    if (!playerId) return;
    const player = gamePlayers.find((player) => player.id === playerId);
    if (!player) return;
    const newPlayers = gamePlayers.filter((player) => player.id !== playerId);
    await handleRemovePlayerFromGame(playerId, game.id);
    setGamePlayers(newPlayers);
    setScoredPlayers((players) => players.filter((p) => p.id !== playerId));
    toast(`${player.name} har tagits bort från matchen!`, {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  async function handleUpdateScores() {
    const scores = scoredPlayers.map((player) => {
      return {
        playerId: player.id,
        buyins: player.buyins,
        stack: player.stack,
      };
    });
    await handleUpdateGameScores(scores, game.id);
    toast("Utfallen har sparats!", {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  async function handleGameRemove() {
    await handleRemoveGame(game.id);
    toast("Matchen har tagits bort!", {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  return (
    <>
      <hr className="my-4" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 lg:p-2"
      >
        <form
          action={handleAddPlayer}
          className="flex flex-col lg:flex-row gap-2"
        >
          <AutoComplete players={nonAssignedPlayers} />
          <Button
            type="submit"
            className="flex items-center justify-center gap-1"
          >
            Lägg till <Plus size={16} />
          </Button>
          <Seating players={gamePlayers} />
        </form>

        <TableProvider
          values={{ players: scoredPlayers, updatePlayer: handleUpdatePlayer }}
        >
          <form className="flex flex-col gap-2" action={handleRemovePlayer}>
            <DataTable columns={columns} data={scoredPlayers} />
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
              <Button
                onClick={handleUpdateScores}
                className="flex items-center gap-2"
                variant="secondary"
                size="sm"
              >
                Spara <SaveIcon size={16} />
              </Button>
              <div className="flex items-center">
                <div className="flex gap-2 items-center">
                  <Badge variant="destructive">Pengar in: {moneyIn} kr</Badge>
                  <Badge variant="secondary">Pengar ut: {moneyOut} kr</Badge>
                </div>
              </div>
            </div>
            <div className="flex content-end">
              <Button
                className="flex items-center gap-2"
                variant="destructive"
                size="sm"
                onClick={handleGameRemove}
              >
                Ta bort match <X size={16} />
              </Button>
              <Badge className="ms-auto" variant="default">
                Snittstack: {Math.floor(moneyIn / (gamePlayers.length || 0))} kr
              </Badge>
            </div>
          </form>
        </TableProvider>
      </div>
    </>
  );
}
