"use client";

import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";
import { Player } from "@prisma/client";
import { getTop12WithMoreThanKGames, getTopPlayers } from "./chart-utils";
import { Separator } from "./ui/separator";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface LeaderboardProps {
  games: ExtendedGame[];
  players: Player[];
}

function shortenName(name: string) {
  const parts = name.trim().split(" ");
  const firstName = parts[0];
  const lastNameParts = parts.slice(1);

  // If name is longer than 20 characters, shorten the last names
  if (name.length > 20) {
    const lastNameInitials = lastNameParts
      .map((part) => (part ? part.charAt(0) : ""))
      .join("");
    return [firstName, lastNameInitials].join(" ").trim();
  } else {
    // Return the full name as is
    return name;
  }
}

export default function Leaderboard({ games, players }: LeaderboardProps) {
  const [moreThan3, setMoreThan3] = useState(false);
  const topPlayers = getTopPlayers(games, players);
  const tournamentPlayers = getTop12WithMoreThanKGames(
    games,
    players,
    2
  ).filter(([name, score]) => name && score);

  const gold = "bg-amber-300";
  const silver = "bg-slate-300";
  const bronze = "bg-amber-800";
  const danger = "bg-red-300";

  const colors = [gold, silver, bronze];

  return (
    <div className="min-w-[250px] flex flex-col gap-4 pb-4">
      <div className="flex items-center">
        <h3 className="text-xl font-bold">Leaderboard</h3>
        <Button
          onClick={() => setMoreThan3((prev) => !prev)}
          variant="outline"
          className="p-0 aspect-square flex items-center justify-center ms-auto"
        >
          <Trophy />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex flex-col rounded-md border lg:max-h-[75vh]">
        {(moreThan3 ? tournamentPlayers : topPlayers)
          .filter(([_, __, games]) => Boolean(games))
          .map(
            ([name, score, games], i) =>
              name && (
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
                  <span className="grow">
                    {i + 1}. {shortenName(name as string)}{" "}
                    {games && `(${games})`}
                  </span>
                  <span>{score} kr</span>
                </li>
              )
          )}
      </ScrollArea>
    </div>
  );
}
