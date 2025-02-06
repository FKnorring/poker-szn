"use client";

import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";
import { Player, PokerRoom, Season } from "@prisma/client";
import { useState } from "react";
import ChartHandler from "./chart-handler";
import SeasonSelector from "./season-selector";
import Leaderboard from "./leaderboard";

interface RoomChartsProps {
  room: PokerRoom;
  seasons: Pick<Season, "id" | "name">[];
  games: ExtendedGame[];
  players: Player[];
  currency: string;
  totalBuyin: number;
}

export default function RoomCharts({
  room,
  seasons,
  games,
  players,
  currency,
  totalBuyin,
}: RoomChartsProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasons.length > 0 ? seasons[0].id : ""
  );

  const filteredGames = selectedSeason
    ? selectedSeason === "all"
      ? games
      : games.filter((game) => game.seasonId === selectedSeason)
    : games;

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <div className="mr-8">
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <p className="text-muted-foreground">
            Total buyin: {room.currency} {totalBuyin}
          </p>
        </div>
        <SeasonSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          onSeasonChange={setSelectedSeason}
        />
      </div>
      <ChartHandler
        games={filteredGames}
        players={players}
        currency={currency}
      />
      <Leaderboard games={filteredGames} players={players} />
    </div>
  );
}
