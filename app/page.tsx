import { Button } from "@/components/ui/button";
import { addPlayer, addGame, getGames, getPlayers, getScores } from "./utils";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";
import Link from "next/link";
import LinePlot from "@/components/lineplot";

export default async function Home() {
  const games = await getGames();
  const players = await getPlayers();
  const scores = await getScores();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href="/edit">Hantera Matcher</Link>
      <LinePlot scores={scores} games={games} players={players} />
    </main>
  );
}
