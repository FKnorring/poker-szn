"use client";

import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Badge } from "./ui/badge";
import { stringToColorHash, getTop12Players } from "./chart-utils";
import TotalChart from "./total-chart";
import { SelectProps } from "@radix-ui/react-select";
import WinRateChart from "./winrate-chart";
import BuyinStackChart from "./buyin-stack-chart";
import WinLossChart from "./win-loss-chart";
import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
interface ChartHandlerProps {
  games: ExtendedGame[];
  players: Player[];
}

function DrawPlayer({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <li onClick={onClick} role="button" className="ms-2">
      <Badge
        variant="outline"
        style={{ backgroundColor: stringToColorHash(name) }}
      >
        <span className="text-xs font-bold hidden lg:block">{name}</span>
        <span className="text-xs font-bold block lg:hidden">
          {name
            .split(" ")
            .map((c) => c[0])
            .join("")}
        </span>
      </Badge>
    </li>
  );
}

interface GameSelectProps extends SelectProps {
  games: ExtendedGame[];
}

function GameSelect({ games, ...props }: GameSelectProps) {
  return (
    <Select {...props}>
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
  );
}

function ChartSelect({ ...props }: SelectProps) {
  return (
    <Select {...props}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Välj diagram" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="total">Total</SelectItem>
        <SelectItem value="winrate">Vinsthalt</SelectItem>
        <SelectItem value="winloss">Vinst/Förlust</SelectItem>
        <SelectItem value="buyinStack">Avg Buyin / Stack</SelectItem>
      </SelectContent>
    </Select>
  );
}

const charts = {
  total: TotalChart,
  winrate: WinRateChart,
  winloss: WinLossChart,
  buyinStack: BuyinStackChart,
};

export default function ChartHandler({ games, players }: ChartHandlerProps) {
  const [showPlayers, setshowPlayers] = useState(
    new Set<string>(players.map(({ name }) => name))
  );

  const [chart, setChart] = useState<
    "total" | "winrate" | "winloss" | "buyinStack"
  >("total");

  const [slideshow, setSlideshow] = useState(false);

  useEffect(() => {
    if (!slideshow) return;
    const interval = setInterval(() => {
      setChart((prev) => {
        if (prev === "total") return "winrate";
        if (prev === "winrate") return "winloss";
        if (prev === "winloss") return "buyinStack";
        if (prev === "buyinStack") return "total";
        return "total";
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [slideshow]);

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

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <GameSelect
          games={games}
          onValueChange={handleSelectPlayersFromMatch}
        />
        <ChartSelect onValueChange={setChart} />
        <Button
          onClick={() => setSlideshow((prev) => !prev)}
          className="p-2 aspect-square rounded-md cursor-pointer"
        >
          {slideshow ? <Pause /> : <Play />}
        </Button>
      </div>
      <ul className="flex flex-wrap">
        {unfilteredPlayers.map(({ name }) => (
          <DrawPlayer
            key={name}
            name={name}
            onClick={() => filterPlayer(name)}
          />
        ))}
      </ul>
      {charts[chart]({
        games,
        players: filteredPlayers,
        renderPlayer: (entry) => (
          <DrawPlayer
            name={entry.value}
            onClick={() => filterPlayer(entry.value)}
          />
        ),
      })}
    </>
  );
}
