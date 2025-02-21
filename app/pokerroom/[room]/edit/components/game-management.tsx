"use client";

import { useState } from "react";
import { ExtendedGame } from "../games";
import { createGame } from "../api";
import { toast } from "sonner";
import CreationManagement from "./creation-management";
import GameList from "./game-list";
import { Separator } from "@/components/ui/separator";
import { PokerRoom, Season } from "@prisma/client";
import PaymentReport from "./payment-report";
import GameSkeleton from "./game-skeleton";

interface GameManagementProps {
  games: ExtendedGame[];
  room: PokerRoom;
  seasonId: string;
  seasons: Season[];
}

export default function GameManagement({
  games: initialGames,
  room,
  seasonId,
  seasons,
}: GameManagementProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [games, setGames] = useState(initialGames);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isCreating, setIsCreating] = useState(false);

  function selectGame(gameId: string) {
    if (gameId === selectedGame) {
      setSelectedGame(null);
      return;
    }
    setSelectedGame(gameId);
  }

  async function handleQuickAddGame() {
    try {
      setIsCreating(true);
      const today = new Date().toISOString().split("T")[0];
      const game = await createGame(room.id, {
        date: today,
        seasonId: seasonId,
        buyIn: room.defaultBuyIn,
      });
      game.date = new Date(game.date);
      setGames((games) =>
        [game, ...games].sort((a, b) => b.date.getTime() - a.date.getTime())
      );
      setSelectedGame(game.id);
      toast.success("Game has been added!", {
        description: "Today's date: " + new Date().toLocaleDateString("sv-SE"),
      });
    } catch (error) {
      toast.error("Failed to add game", {
        description: "Please try again",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAddNewGame() {
    if (!selectedDate) return;
    try {
      setIsCreating(true);
      const date = selectedDate.toISOString().split("T")[0];
      const game = await createGame(room.id, {
        date,
        seasonId: seasonId,
        buyIn: room.defaultBuyIn,
      });
      game.date = new Date(game.date);
      setGames((games) =>
        [game, ...games].sort((a, b) => b.date.getTime() - a.date.getTime())
      );
      setSelectedGame(game.id);
      toast.success("Game has been added!", {
        description: selectedDate.toLocaleDateString("sv-SE"),
      });
    } catch (error) {
      toast.error("Failed to add game", {
        description: "Please try again",
      });
    } finally {
      setIsCreating(false);
    }
  }

  function handleGameRemoved(gameId: string) {
    setGames((games) => games.filter((game) => game.id !== gameId));
    if (selectedGame === gameId) {
      setSelectedGame(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <CreationManagement
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onQuickAdd={handleQuickAddGame}
          onAddGame={handleAddNewGame}
          isCreating={isCreating}
        />
        <PaymentReport games={games} room={room} />
      </div>
      <Separator />
      <div className="space-y-2">
        {isCreating && <GameSkeleton />}
        <GameList
          games={games}
          selectedGame={selectedGame}
          onGameSelect={selectGame}
          onGameRemoved={handleGameRemoved}
          room={room}
          seasons={seasons}
        />
      </div>
    </div>
  );
}
