import { Button } from "@/components/ui/button";
import { addPlayer, addGame, getGames, getPlayers, getScores } from "./utils";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";
import Link from "next/link";
import ChartHandler from "@/components/chart-handler";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const games = await getGames();
  const players = await getPlayers();
  const scores = await getScores();
  return (
    <main className="flex h-screen flex-col p-12 gap-4">
      <div className="flex">
        <h1 className="text-4xl font-bold flex-grow">Pokersäsongen VT 2024</h1>
        <Button>
          <Link href="/edit">Hantera Matcher</Link>
        </Button>
      </div>
      <Separator />
      <div className="flex-grow flex h-full w-full flex-col gap-2">
        <ChartHandler games={games} players={players} />
      </div>
    </main>
  );
}
