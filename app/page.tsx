import { Button } from "@/components/ui/button";
import { addPlayer, addGame, getGames, getPlayers } from "./utils";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href="/edit">Hantera Matcher</Link>
    </main>
  );
}
