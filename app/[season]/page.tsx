// pages/index/[season].tsx
import { useParams } from "next/navigation";
import { getGames, getPlayers, getTotalBuyin } from "@/app/utils";
import ChartHandler from "@/components/chart-handler";
import Leaderboard from "@/components/leaderboard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Spade, Heart, Diamond, Club, Coins } from "lucide-react";
import { GeistMono } from "geist/font/mono";
import { ModeToggle } from "@/components/toggle-theme";
import Header from "@/components/header";
import { redirect } from "next/navigation";
import { ALL_SEASONS } from "@/config/season";

export async function generateStaticParams() {
  return [
    ...ALL_SEASONS.map((season) => ({ season: season.id.toString() })),
    { season: "all" },
  ];
}

export default async function Home({ params }: { params: { season: string } }) {
  const { season } = params;

  const isValidSeason =
    season === "all" || ALL_SEASONS.some((s) => s.id.toString() === season);
  if (!isValidSeason) {
    redirect("/");
  }

  // Ensure season is a number
  const seasonNumber = parseInt(season as string, 10);

  const games = await getGames(seasonNumber, season === "all");
  const players = await getPlayers(seasonNumber, season === "all");
  const totalBuyin = await getTotalBuyin();

  return (
    <>
      <Header totalBuyin={totalBuyin} showSeasonSelector />
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
