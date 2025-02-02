import { getGames, getPlayers, getTotalBuyin } from "./utils";
import ChartHandler from "@/components/chart-handler";
import { Separator } from "@/components/ui/separator";
import Leaderboard from "@/components/leaderboard";
import Header from "@/components/header";

export default async function Home() {
  const games = await getGames();
  const players = await getPlayers();
  const totalBuyin = await getTotalBuyin();

  return (
    <>
      <Header totalBuyin={totalBuyin} />
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
