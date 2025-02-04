"use client";

import { Player } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Edit2, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PlayerWithCount } from "../utils";

interface PlayerManagementProps {
  players: PlayerWithCount[];
  onPlayerCreate: (name: string) => Promise<Player>;
  onPlayerRemove: (playerId: string) => Promise<void>;
}

export default function PlayerManagement({
  players: initialPlayers,
  onPlayerCreate,
  onPlayerRemove,
}: PlayerManagementProps) {
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [players, setPlayers] = useState(initialPlayers);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({
    create: false,
  });

  const setLoading = (key: string, value: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name", {
        description: "The player name is required",
      });
      return;
    }

    try {
      setLoading("create", true);
      const newPlayer = await onPlayerCreate(newPlayerName);
      setPlayers((prev) => [...prev, { ...newPlayer, _count: { games: 0 } }]);
      setIsAddingPlayer(false);
      setNewPlayerName("");
      toast.success("Player added successfully!");
    } catch (error) {
      toast.error("Failed to add player", {
        description: "Please try again",
      });
    } finally {
      setLoading("create", false);
    }
  };

  const handleRemovePlayer = async (playerId: string, gameCount: number) => {
    if (gameCount > 0) {
      toast.error("Cannot remove player", {
        description: "Player has participated in games",
      });
      return;
    }

    try {
      setLoading(playerId, true);
      await onPlayerRemove(playerId);
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      toast.success("Player removed successfully!");
    } catch (error) {
      toast.error("Failed to remove player", {
        description: "Please try again",
      });
    } finally {
      setLoading(playerId, false);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Players</h2>
        {!isAddingPlayer && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingPlayer(true)}
            className="flex items-center gap-1"
            disabled={loadingStates.create}
          >
            <Plus className="h-4 w-4" /> Add Player
          </Button>
        )}
      </div>

      {isAddingPlayer && (
        <div className="border-b pb-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">New Player</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingPlayer(false)}
              disabled={loadingStates.create}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              disabled={loadingStates.create}
            />
            <Button
              onClick={handleCreatePlayer}
              className="w-full"
              disabled={loadingStates.create}
            >
              {loadingStates.create ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {loadingStates.create ? "Adding..." : "Add Player"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
          >
            <div>
              <p className="font-medium">{player.name}</p>
              <p className="text-sm text-muted-foreground">
                {player._count.games}{" "}
                {player._count.games === 1 ? "game" : "games"} played
              </p>
            </div>
            {player._count.games === 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  handleRemovePlayer(player.id, player._count.games)
                }
                className="text-destructive hover:text-destructive"
                disabled={loadingStates[player.id]}
              >
                {loadingStates[player.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
