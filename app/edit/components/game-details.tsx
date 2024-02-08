import { Game, Player, Score } from "@prisma/client";
import { useEditGame } from "../context";
import { useOptimistic, useRef } from "react";
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
  const [gamePlayers, addGamePlayer] = useOptimistic(
    game.players,
    (state: Player[], player: Player) => [...state, player]
  );
  const nonAssignedPlayers = getNonAssignedPlayers(players, gamePlayers);
  const scoredPlayers = getPlayerScores(game.scores, gamePlayers);

  async function handleAddPlayer(formData: FormData) {
    const name = formData.get("player") as string;
    if (!name) return;
    const player = players.find((player) => player.name === name);
    if (gamePlayers.some((p) => p.id === player?.id)) return;
    if (!player) {
      await handleAddNewPlayerToGame(name, game.id);
      return toast(`Ny spelare ${name} har lagts till i matchen!`, {
        description: new Date().toLocaleTimeString("sv-SE"),
      });
    }
    await handleAddPlayerToGame(player.id, game.id);
    toast(`${name} har lagts till i matchen!`, {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  async function handleUpdateScores(formData: FormData) {
    const scores = scoredPlayers.map((player) => {
      const score = formData.get(`score-${player.id}`) as string;
      return {
        playerId: player.id,
        score: Number(score),
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

        <form className="flex flex-col gap-2" action={handleUpdateScores}>
          <DataTable columns={columns} data={scoredPlayers} />
          <Button
            type="submit"
            className="flex items-center gap-2"
            variant="destructive"
          >
            Spara <SaveIcon size={16} />
          </Button>
        </form>
      </div>
    </>
  );
}
