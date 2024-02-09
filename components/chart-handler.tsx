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
  return (
    <li
      onClick={onClick}
      role="button"
      className="ms-2 my-[2px] px-2 py-1 border flex items-center gap-2 rounded-md"
    >
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: stringToColorHash(name) }}
      ></div>
      <span className="text-xs font-bold">{name}</span>
    </li>
  );
}

function getTop12Players(games: ExtendedGame[], players: Player[]) {
  const data = extractGameData(games, players);
  const latest = data[data.length - 1];
  // @ts-ignore
  delete latest.name;
  // @ts-ignore
  const sorted = Object.entries(latest).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 12).map(([name]) => name);
}

export default function ChartHandler({ games, players }: ChartHandlerProps) {
  const [showPlayers, setshowPlayers] = useState(
    new Set<string>(players.map(({ name }) => name))
  );

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

  return (
    <>
      <div>
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
