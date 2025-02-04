"use client";

import { useState } from "react";
import { ExtendedGame } from "../games";
import { handleAddGame } from "../api";
import { toast } from "sonner";
import CreationManagement from "./creation-management";
import GameList from "./game-list";
import { Separator } from "@/components/ui/separator";
import { PokerRoom, Season } from "@prisma/client";

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

  function selectGame(gameId: string) {
    if (gameId === selectedGame) {
      setSelectedGame(null);
      return;
    }
    setSelectedGame(gameId);
  }

  async function handleQuickAddGame() {
    const today = new Date().toISOString().split("T")[0];
    const game = await handleAddGame(today, room.id, seasonId);
    const newGame = {
      ...game,
      players: [],
      scores: [],
      season: games[0]?.season || { id: seasonId },
    } as unknown as ExtendedGame;
    setGames((games) =>
      [newGame, ...games].sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    setSelectedGame(game.id);
    toast.success("Game has been added!", {
      description: "Today's date: " + new Date().toLocaleDateString("sv-SE"),
    });
  }

  async function handleAddNewGame() {
    if (!selectedDate) return;
    const game = await handleAddGame(
      new Date(selectedDate).toISOString().split("T")[0],
      room.id,
      seasonId
    );

    const newGame = {
      ...game,
      players: [],
      scores: [],
      season: games[0]?.season || { id: seasonId },
    } as unknown as ExtendedGame;
    setGames((games) =>
      [newGame, ...games].sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    setSelectedGame(game.id);
    toast.success("Game has been added!", {
      description: selectedDate.toLocaleDateString("sv-SE"),
    });
  }

  function handleGameRemoved(gameId: string) {
    setGames((games) => games.filter((game) => game.id !== gameId));
    if (selectedGame === gameId) {
      setSelectedGame(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-2">
      <CreationManagement
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onQuickAdd={handleQuickAddGame}
        onAddGame={handleAddNewGame}
      />
      <Separator />
      <GameList
        games={games}
        selectedGame={selectedGame}
        onGameSelect={selectGame}
        onGameRemoved={handleGameRemoved}
        room={room}
        seasons={seasons}
      />
    </div>
  );
}
