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
    <>
      <div className="flex items-center gap-2">
        <h1
          className={`text-3xl lg:text-4xl font-extrabold tracking-tighter lg:tracking-widest ${GeistMono.className}`}
        >
          POKER SZN VT_24
        </h1>
        <div className="hidden lg:flex gap-2">
          <Heart size={32} />
          <Spade size={32} />
          <Diamond size={32} />
          <Club size={32} />
        </div>
        <div className="ms-auto">
          <ModeToggle />
        </div>
        <Link href="/edit">
          <Button size="icon">
            <Calendar size={16} />
          </Button>
        </Link>
      </div>
      <Separator />
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="flex min-h-[85dvh] h-full w-full flex-col gap-2">
          <ChartHandler games={games} players={players} />
        </div>
        <Separator orientation="horizontal" className="lg:hidden" />
        <Separator orientation="vertical" className="hidden lg:block" />
        <Leaderboard games={games} players={players} />
      </div>
    </>
  );
}

export const revalidate = 60;
export const dynamic = "force-dynamic";
