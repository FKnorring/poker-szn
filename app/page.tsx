import { Button } from "@/components/ui/button";
import { getGames, getPlayers } from "./utils";
import Link from "next/link";
import ChartHandler from "@/components/chart-handler";
import { Separator } from "@/components/ui/separator";
import Leaderboard from "@/components/leaderboard";
import { Calendar, Spade, Heart, Diamond, Club } from "lucide-react";
import { GeistMono } from "geist/font/mono";
import { ModeToggle } from "@/components/toggle-theme";

export default async function Home() {
  const games = await getGames();
  const players = await getPlayers();

  return (
    <main className="flex h-screen flex-col p-8 gap-4">
      <div className="flex items-center gap-2">
        <h1
          className={`text-4xl font-extrabold tracking-widest ${GeistMono.className}`}
        >
          POKER SZN VT_24
        </h1>
        <Heart size={32} />
        <Spade size={32} />
        <Diamond size={32} />
        <Club size={32} />
        <div className="ms-auto">
          <ModeToggle />
        </div>
        <Link href="/edit">
          <Button className="gap-2">
            Hantera Matcher <Calendar size={16} />
          </Button>
        </Link>
      </div>
      <Separator />
      <div className="flex flex-grow gap-4">
        <div className="flex-grow flex h-full w-full flex-col gap-2">
          <ChartHandler games={games} players={players} />
        </div>
        <Separator orientation="vertical" />
        <Leaderboard games={games} players={players} />
      </div>
    </main>
  );
}
