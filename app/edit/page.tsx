import { getGames, getPlayers } from "@/app/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Games from "./games";
import { Separator } from "@/components/ui/separator";
import { BarChart2 } from "lucide-react";
import { GeistMono } from "geist/font/mono";

export default async function EditGames() {
  const _games = await getGames();
  const games = _games.sort((a, b) => b.date.getTime() - a.date.getTime());
  const players = await getPlayers();

  return (
    <main className="flex min-h-screen flex-col p-12 gap-4">
      <div className="flex">
        <h1
          className={`text-4xl font-extrabold tracking-tight flex-grow ${GeistMono.className}`}
        >
          POKER SZN VT_24
        </h1>

        <Link href="/">
          <Button className="gap-2">
            Visa Statisik <BarChart2 size={16} />
          </Button>
        </Link>
      </div>
      <Separator />
      <Games games={games} players={players} />
    </main>
  );
}
