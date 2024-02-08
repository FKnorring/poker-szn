import { Game, Player, Score } from "@prisma/client";
import { TableProvider, useEditGame } from "../context";
import { useOptimistic, useRef, useState } from "react";
import { getNonAssignedPlayers, getPlayerScores } from "../utils";
import {
  handleAddPlayerToGame,
  handleAddNewPlayerToGame,
  handleUpdateGameScores,
} from "../api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExtendedGame } from "../games";
import AutoComplete from "./autocomplete";
import { Button } from "@/components/ui/button";
import { Plus, Save, SaveIcon } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { toast } from "sonner";

export default function GameDetails({ game }: { game: ExtendedGame }) {
  const { players } = useEditGame();
  const [gamePlayers, setGamePlayers] = useState(game.players);
  const [scoredPlayers, setScoredPlayers] = useState(
    getPlayerScores(game.scores, gamePlayers)
  );

  const moneyIn = scoredPlayers.reduce(
    (acc, player) => acc + player.buyins * 100,
    0
  );
  const moneyOut = scoredPlayers.reduce((acc, player) => acc + player.stack, 0);

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
      const { player, score } = await handleAddNewPlayerToGame(name, game.id);
      setGamePlayers((players) => [...players, player]);
      setScoredPlayers((players) => [
        ...players,
        { ...player, buyins: 1, stack: 0 },
      ]);
      return toast(`Ny spelare ${name} har lagts till i matchen!`, {
        description: new Date().toLocaleTimeString("sv-SE"),
      });
    }
    await handleAddPlayerToGame(player.id, game.id);
    setGamePlayers((players) => [...players, player]);
    setScoredPlayers((players) => [
      ...players,
      { ...player, buyins: 1, stack: 0 },
    ]);
    toast(`${name} har lagts till i matchen!`, {
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

  return (
    <>
      <hr className="my-4" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 p-2"
      >
        <form action={handleAddPlayer} className="flex gap-2">
          <AutoComplete players={nonAssignedPlayers} />
          <Button
            type="submit"
            className="flex items-center justify-center gap-1"
          >
            Lägg till spelare <Plus size={16} />
          </Button>
        </form>

        <TableProvider
          values={{ players: scoredPlayers, updatePlayer: handleUpdatePlayer }}
        >
          <form className="flex flex-col gap-2" action={handleUpdateScores}>
            <DataTable columns={columns} data={scoredPlayers} />
            <div className="flex justify-between">
              <Button
                type="submit"
                className="flex items-center gap-2"
                variant="destructive"
              >
                Spara <SaveIcon size={16} />
              </Button>
              <div className="flex items-center">
                <div className="flex gap-2 items-center">
                  <span className="px-2 py-1 bg-orange-800 text-xs text-background font-bold m-0  rounded-md">
                    Pengar in: {moneyIn} kr
                  </span>
                  <span className="px-2 py-1 bg-lime-800 text-xs text-background font-bold m-0 rounded-md">
                    Pengar ut: {moneyOut} kr
                  </span>
                </div>
              </div>
            </div>
          </form>
        </TableProvider>
      </div>
    </>
  );
}
