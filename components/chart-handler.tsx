"use client";

import { ExtendedGame } from "@/app/edit/games";
import Chart, { extractGameData, stringToColorHash } from "./chart";
import { Player } from "@prisma/client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartHandlerProps {
  games: ExtendedGame[];
  players: Player[];
}

function DrawPlayer({ name, onClick }: { name: string; onClick: () => void }) {
  const windowWidth = window.innerWidth;
  console.log(windowWidth);
  return (
    <li
      onClick={onClick}
      role="button"
      className="ms-2 my-[2px] p-1 border flex items-center gap-2 rounded-md text-black"
    >
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: stringToColorHash(name) }}
      ></div>
      <span className="text-xs font-bold hidden lg:block">{name}</span>
      <span className="text-xs font-bold block lg:hidden">
        {name
          .split(" ")
          .map((c) => c[0])
          .join("")}
      </span>
    </li>
  );
}

export function getTopPlayers(games: ExtendedGame[], players: Player[]) {
  const data = extractGameData(games, players);
  const latest = data[data.length - 1];
  // @ts-ignore
  delete latest.name;
  // @ts-ignore
  return Object.entries(latest).sort((a, b) => b[1] - a[1]);
}

function getTop12Players(games: ExtendedGame[], players: Player[]) {
  return getTopPlayers(games, players)
    .slice(0, 12)
    .map(([name]) => name);
}

export default function ChartHandler({ games, players }: ChartHandlerProps) {
  const [showPlayers, setshowPlayers] = useState(
    new Set<string>(players.map(({ name }) => name))
  );
  const [interval, setInterval] = useState<[Date | string, Date | string]>([
    "0",
    "0",
  ]);

  function filterPlayer(name: string) {
    const newSet = new Set(showPlayers);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setshowPlayers(newSet);
  }

  function handleSelectPlayersFromMatch(gameId: string) {
    if (gameId === "all") {
      setshowPlayers(new Set(players.map(({ name }) => name)));
      return;
    }
    if (gameId === "top12") {
      const top12 = getTop12Players(games, players);
      setshowPlayers(new Set(top12));
      return;
    }
    if (gameId === "none") {
      setshowPlayers(new Set());
      return;
    }
    const game = games.find((game) => game.id === Number(gameId));
    if (!game) {
      return;
    }
    const newSet = new Set<string>();
    game.players.forEach((player) => {
      newSet.add(player.name);
    });
    setshowPlayers(newSet);
  }

  const filteredPlayers = players.filter(({ name }) => showPlayers.has(name));
  const unfilteredPlayers = players.filter(
    ({ name }) => !showPlayers.has(name)
  );

  const gamesInInterval = games.filter((game) => {
    const [from, to] = interval;
    if (from === "0" || to === "0") {
      return true;
    }
    return (
      game.date.getTime() >= new Date(from).getTime() &&
      game.date.getTime() <= new Date(to).getTime()
    );
  });

  return (
    <>
      <div className="flex gap-2">
        <Select onValueChange={handleSelectPlayersFromMatch}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Välj spelare från match" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla matcher</SelectItem>
            <SelectItem value="top12">Top 12</SelectItem>
            {games
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((game) => (
                <SelectItem key={game.id} value={game.id.toString()}>
                  {game.date.toLocaleDateString()}
                </SelectItem>
              ))}
            <SelectItem value="none">Rensa spelare</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap">
        {unfilteredPlayers.map(({ name }) => (
          <DrawPlayer
            key={name}
            name={name}
            onClick={() => filterPlayer(name)}
          />
        ))}
      </div>
      <Chart
        games={games}
        players={filteredPlayers}
        renderPlayer={(entry) => (
          <DrawPlayer
            name={entry.value}
            onClick={() => filterPlayer(entry.value)}
          />
        )}
      />
    </>
  );
}
