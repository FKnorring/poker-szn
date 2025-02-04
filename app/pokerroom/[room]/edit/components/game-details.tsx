import { Game, Player, PokerRoom, Score, Season } from "@prisma/client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GameSettings from "./game-settings";
import { updateGameSettings } from "../api";

interface GameDetailsProps {
  game: ExtendedGame;
  onGameRemoved: (gameId: string) => void;
  room: PokerRoom;
  seasons: Season[];
}

export default function GameDetails({
  game,
  onGameRemoved,
  room,
  seasons,
}: GameDetailsProps) {
  const { players } = useEditGame();
  const [gamePlayers, setGamePlayers] = useState(game.players);
  const [scoredPlayers, setScoredPlayers] = useState(
    getPlayerScores(game.scores, gamePlayers)
  );
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const { moneyIn, moneyOut } = getGameMoney(scoredPlayers, game.buyIn);

  const nonAssignedPlayers = getNonAssignedPlayers(players, gamePlayers);

  function handleUpdatePlayer(
    id: string,
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
      const { player } = await handleAddNewPlayerToGame(name, game.id, room.id);
      setGamePlayers((players) => [...players, player]);
      setScoredPlayers((players) => [
        ...players,

        { ...player, buyins: 1, stack: 100 },
      ]);
      toast(`New player ${name} has been added to the game!`, {
        description: new Date().toLocaleTimeString("sv-SE"),
      });

      return;
    }
    await handleAddPlayerToGame(player.id, game.id);
    setGamePlayers((players) => [...players, player]);
    setScoredPlayers((players) => [
      ...players,
      { ...player, buyins: 1, stack: 100 },
    ]);
    toast(`${name} has been added to the game!`, {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  async function handleRemovePlayer(formData: FormData) {
    const playerId = formData.get("playerId") as string;
    if (!playerId) return;
    const player = gamePlayers.find((player) => player.id === playerId);
    if (!player) return;
    const newPlayers = gamePlayers.filter((player) => player.id !== playerId);
    await handleRemovePlayerFromGame(playerId, game.id);
    setGamePlayers(newPlayers);
    setScoredPlayers((players) => players.filter((p) => p.id !== playerId));
    toast(`${player.name} has been removed from the game!`, {
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
    toast("Scores have been saved!", {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  async function handleGameRemove() {
    await handleRemoveGame(game.id);
    onGameRemoved(game.id);
    setShowRemoveDialog(false);
    toast("Game has been removed!", {
      description: new Date().toLocaleTimeString("sv-SE"),
    });
  }

  const handleUpdateSettings = async (data: {
    seasonId?: string;
    buyIn?: number;
  }) => {
    const updatedGame = await updateGameSettings(room.id, game.id, data);
    // Update local state if needed
    if (data.buyIn) {
      setScoredPlayers(getPlayerScores(game.scores, gamePlayers));
    }
  };

  return (
    <>
      <hr className="my-4" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 lg:p-2"
      >
        <GameSettings
          game={game}
          seasons={seasons}
          onUpdate={handleUpdateSettings}
        />
        <form
          action={handleAddPlayer}
          className="flex flex-col lg:flex-row gap-2"
        >
          <AutoComplete players={nonAssignedPlayers} roomId={room.id} />
          <Button
            type="submit"
            className="flex items-center justify-center gap-1"
          >
            Add <Plus size={16} />
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
                Save scores <SaveIcon size={16} />
              </Button>
              <div className="flex items-center">
                <div className="flex gap-2 items-center">
                  <Badge variant="destructive">
                    Money in: {moneyIn} {room.currency}
                  </Badge>
                  <Badge variant="secondary">
                    Money out: {moneyOut} {room.currency}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex content-end">
              <Dialog
                open={showRemoveDialog}
                onOpenChange={setShowRemoveDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    className="flex items-center gap-2"
                    variant="destructive"
                    size="sm"
                    type="button"
                  >
                    Remove game <X size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove game</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove the game from{" "}
                      {game.date.toLocaleDateString()}? This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setShowRemoveDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleGameRemove}>
                      Remove
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Badge className="ms-auto rounded-lg font-bold" variant="default">
                Average stack: {Math.floor(moneyIn / (gamePlayers.length || 0))}{" "}
                {room.currency}
              </Badge>
            </div>
          </form>
        </TableProvider>
      </div>
    </>
  );
}
