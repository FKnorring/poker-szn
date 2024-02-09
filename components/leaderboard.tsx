"use client";

import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";
import { getTopPlayers } from "./chart-handler";
import { Separator } from "./ui/separator";

interface LeaderboardProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function Leaderboard({ games, players }: LeaderboardProps) {
  const topPlayers = getTopPlayers(games, players);

  const gold = "bg-yellow-300";
  const silver = "bg-gray-300";
  const bronze = "bg-orange-800";

  const colors = [gold, silver, bronze];

  return (
    <div className="min-w-[250px] flex flex-col gap-4">
      <h3 className="text-xl font-bold">Leaderboard</h3>
      <Separator />
      <ul className="flex flex-col">
        {topPlayers.map(([name, score], i) => (
          <li
            key={name}
            className={`flex gap-2 items-center border-t shadow p-2 text-sm font-semibold ${
              i < 3 ? colors[i] : ""
            }`}
          >
            <span className="flex-grow">
              {i + 1}. {name}
            </span>
            <span>{score} kr</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
