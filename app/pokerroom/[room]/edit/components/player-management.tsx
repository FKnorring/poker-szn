"use client";

import { Player } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PlayerWithCount } from "../utils";

interface PlayerManagementProps {
  players: PlayerWithCount[];
  onPlayerCreate: (name: string) => Promise<void>;
  onPlayerRemove: (playerId: string) => Promise<void>;
}

export default function PlayerManagement({ 
  players,
  onPlayerCreate,
  onPlayerRemove
}: PlayerManagementProps) {
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) {
      toast("Please enter a player name", {
        description: "The player name is required"
      });
      return;
    }

    try {
      await onPlayerCreate(newPlayerName);
      setIsAddingPlayer(false);
      setNewPlayerName("");
      toast("Player added successfully!");
    } catch (error) {
      toast("Failed to add player", {
        description: "Please try again"
      });
    }
  };

  const handleRemovePlayer = async (playerId: string, gameCount: number) => {
    if (gameCount > 0) {
      toast("Cannot remove player", {
        description: "Player has participated in games"
      });
      return;
    }

    try {
      await onPlayerRemove(playerId);
      toast("Player removed successfully!");
    } catch (error) {
      toast("Failed to remove player", {
        description: "Please try again"
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Players</h2>
        {!isAddingPlayer && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingPlayer(true)}
            className="flex items-center gap-1"
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
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
            />
            <Button onClick={handleCreatePlayer} className="w-full">
              Add Player
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div>
              <p className="font-medium">{player.name}</p>
              <p className="text-sm text-muted-foreground">
                {player._count.games} {player._count.games === 1 ? 'game' : 'games'} played
              </p>
            </div>
            {player._count.games === 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemovePlayer(player.id, player._count.games)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 