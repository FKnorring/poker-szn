import ChartHandler from "@/components/chart-handler";
import { Separator } from "@/components/ui/separator";
import Leaderboard from "@/components/leaderboard";
import Header from "@/components/header";
import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";

interface PageLayoutProps {
  games: ExtendedGame[];
  players: Player[];
  totalBuyin: number;
}

export default function PageLayout({
  games,
  players,
  totalBuyin,
}: PageLayoutProps) {
  return (
    <>
      <Header totalBuyin={totalBuyin} showSeasonSelector />
      <div className="flex-1 flex gap-4 flex-col lg:flex-row">
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <ChartHandler games={games} players={players} />
        </div>
        <Separator orientation="horizontal" className="lg:hidden" />
        <Separator orientation="vertical" className="hidden lg:block" />
        <Leaderboard games={games} players={players} />
      </div>
    </>
  );
}
