import { getGames, getPlayers } from "@/app/utils";
import Games from "./games";

export default async function EditGames() {
  const _games = await getGames();
  const games = _games.sort((a, b) => b.date.getTime() - a.date.getTime());
  const players = await getPlayers();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Games games={games} players={players} />
    </main>
  );
}
