"use client";

import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";
import { getTopPlayers } from "./chart-handler";
import { Separator } from "./ui/separator";
import { Trophy } from "lucide-react";

interface LeaderboardProps {
  games: ExtendedGame[];
  players: Player[];
}

export default function Leaderboard({ games, players }: LeaderboardProps) {
  const topPlayers = getTopPlayers(games, players);

  const gold = "bg-amber-300";
  const silver = "bg-slate-300";
  const bronze = "bg-amber-800";
  const danger = "bg-red-300";

  const colors = [gold, silver, bronze];

  return (
    <div className="min-w-[250px] flex flex-col gap-4">
      <div className="flex items-center">
        <h3 className="text-xl font-bold">Leaderboard</h3>
        <Trophy className="ms-auto" />
      </div>
      <Separator />
      <ul className="flex flex-col rounded-md overflow-hidden border">
        {topPlayers.map(([name, score], i) => (
          <li
            key={name}
            className={`flex gap-2 items-center shadow p-2 text-sm font-semibold ${
              i < 3
                ? colors[i] + " bg-opacity-50"
                : i > 11
                ? danger + " bg-opacity-25"
                : ""
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
