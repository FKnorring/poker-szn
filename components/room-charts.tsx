"use client";

import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";
import { Player, Season } from "@prisma/client";
import { useState } from "react";
import ChartHandler from "./chart-handler";
import SeasonSelector from "./season-selector";
import Leaderboard from "./leaderboard";

interface RoomChartsProps {
  roomId: string;
  seasons: Pick<Season, "id" | "name">[];
  games: ExtendedGame[];
  players: Player[];
  currency: string;
}

export default function RoomCharts({
  roomId,
  seasons,
  games,
  players,
  currency,
}: RoomChartsProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasons.length > 0 ? seasons[0].id : ""
  );

  const filteredGames = selectedSeason
    ? games.filter((game) => game.seasonId === selectedSeason)
    : games;

  return (
    <div className="space-y-8">
      <div className="flex items-center">
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
