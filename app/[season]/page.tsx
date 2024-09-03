// pages/index/[season].tsx
import { useParams } from "next/navigation";
import { getGames, getPlayers } from "@/app/utils";
import ChartHandler from "@/components/chart-handler";
import Leaderboard from "@/components/leaderboard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Spade, Heart, Diamond, Club, Coins } from "lucide-react";
import { GeistMono } from "geist/font/mono";
import { ModeToggle } from "@/components/toggle-theme";

export default async function Home({ params }: { params: { season: string } }) {
  const { season } = params;

  // Ensure season is a number
  const seasonNumber = parseInt(season as string, 10);

  const games = await getGames(seasonNumber);
  const players = await getPlayers();

  return (
    <>
      <div className="flex items-center gap-2">
        <h1
          className={`text-3xl lg:text-4xl font-extrabold tracking-tighter lg:tracking-widest ${GeistMono.className}`}
        >
          POKER SZN HT_24
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
        <Link href="/play">
          <Button variant="destructive" className="gap-1">
            <Coins size={16} />
            Spela
          </Button>
        </Link>
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
