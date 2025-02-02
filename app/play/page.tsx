import { GeistMono } from "geist/font/mono";
import { fetchLatestGame, getPlayers } from "../utils";
import { isTimeToPlay } from "./utils";
import AutoComplete from "../edit/components/autocomplete";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getGameMoney, getPlayerScores } from "../edit/utils";
import Link from "next/link";
import Header from "@/components/header";

export default async function Play() {
  const latestGame = await fetchLatestGame();

  if (!latestGame) {
    return (
      <div className="flex items-center justify-center h-full gap-4 flex-col">
        <h1 className={`text-4xl font-extrabold tracking-widest ${GeistMono.className}`}>
          POKER SZN HT_24
        </h1>
        <p className="text-lg text-center">Inga matcher har spelats än.</p>
      </div>
    );
  }

  const playTime = isTimeToPlay(latestGame?.date);

  const scoredGamePlayers = getPlayerScores(
    latestGame.scores,
    latestGame.players
  ).sort((a, b) => b.stack - b.buyins * 100 - (a.stack - a.buyins * 100));

  const { moneyIn, moneyOut } = getGameMoney(scoredGamePlayers);

  return (
    <>
      <Header showStats showPlay={false} />
      <div className="flex-grow flex-col flex items-center h-full">
        {playTime ? (
          <p>{latestGame.date.toLocaleDateString()}</p>
        ) : (
          <p>Resultat från {latestGame.date.toLocaleDateString()}</p>
        )}
        <ul className="w-full p-4 gap-1 flex flex-col">
          {scoredGamePlayers.map(({ id, name, buyins, stack }) => (
            <Link href={`/play/${id}`} key={id}>
              <li className="p-2 border flex rounded">
                <span className="me-auto">
                  {name} ({buyins})
                </span>
                <span>{-buyins * 100 + stack}</span>
              </li>
            </Link>
          ))}
          <li className={`flex gap-1 text-xs font-bold ${GeistMono.className}`}>
            <span className="p-1 border flex rounded w-full bg-green-300">
              IN: {moneyIn}
            </span>
            <span className="p-1 border flex rounded w-full bg-red-300">
              UT: {moneyOut}
            </span>
          </li>
        </ul>
      </div>
    </>
  );
}
