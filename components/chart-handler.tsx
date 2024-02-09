"use client";

import { ExtendedGame } from "@/app/edit/games";
import Chart, { stringToColorHash } from "./chart";
import { Player } from "@prisma/client";
import { useState } from "react";

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

export default function ChartHandler({ games, players }: ChartHandlerProps) {
  const [hidePlayers, setHidePlayers] = useState(new Set<string>());

  function filterPlayer(name: string) {
    const newSet = new Set(hidePlayers);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setHidePlayers(newSet);
  }

  const filteredPlayers = players.filter(({ name }) => !hidePlayers.has(name));
  const unfilteredPlayers = players.filter(({ name }) => hidePlayers.has(name));

  return (
    <>
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
