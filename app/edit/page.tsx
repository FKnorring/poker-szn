import { getGames, getPlayers } from "@/app/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Games from "./games";
import { Separator } from "@/components/ui/separator";
import { BarChart2 } from "lucide-react";
import { GeistMono } from "geist/font/mono";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Header from "@/components/header";

export default async function EditGames() {
  const { isAuthenticated, getPermissions } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-full gap-4 flex-col">
        <h1
          className={`text-4xl font-extrabold tracking-widest ${GeistMono.className}`}
        >
          POKER SZN HT_24
        </h1>
        <LoginLink className="text-lg text-center">
          Logga in för att se statistik och lägga till matcher.
        </LoginLink>
      </div>
    );
  }

  const permissions = await getPermissions();
  if (permissions && !permissions.permissions.includes("edit")) {
    return (
      <div className="flex items-center justify-center h-full gap-4 flex-col">
        <h1
          className={`text-4xl font-extrabold tracking-widest ${GeistMono.className}`}
        >
          POKER SZN HT_24
        </h1>
        <p className="text-lg text-center">
          Du har inte tillräckliga rättigheter för att redigera matcher.
        </p>
        <Link href="/">
          <Button className="gap-2">
            Gå tillbaka till statisik <BarChart2 size={16} />
          </Button>
        </Link>
      </div>
    );
  }

  const games = await getGames(undefined, true);
  const players = await getPlayers(undefined, true);

  return (
    <>
      <Header showStats showPlay showEdit={false} />
      <Games games={games} players={players} />
    </>
  );
}
