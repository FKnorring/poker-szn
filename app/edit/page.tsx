import { getGames, getPlayers } from "@/app/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Games from "./games";
import { Separator } from "@/components/ui/separator";
import { BarChart2 } from "lucide-react";
import { GeistMono } from "geist/font/mono";
import { Heart, Spade, Diamond, Club } from "lucide-react";

export default async function EditGames() {
  const _games = await getGames();
  const games = _games.sort((a, b) => b.date.getTime() - a.date.getTime());
  const players = await getPlayers();

  return (
    <>
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
        <Link className="ms-auto" href="/">
          <Button className="gap-2">
            Visa Statisik <BarChart2 size={16} />
          </Button>
        </Link>
      </div>
      <Separator />
      <Games games={games} players={players} />
    </>
  );
}

export const revalidate = 60;
export const dynamic = "force-dynamic";
