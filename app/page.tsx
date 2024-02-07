import { Button } from "@/components/ui/button";
import { addPlayer, addGame, getGames, getPlayers } from "./utils";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";

export default async function Home() {
  const games = await getGames();
  const players = await getPlayers();

  async function formAddPlayer(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    await addPlayer(name);
  }

  async function formAddGame(formData: FormData) {
    "use server";
    const date = new Date(formData.get("date") as string);
    await addGame(date);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Leaderboard</h1>
      <section>
        <h2 className="text-2xl font-bold">Players</h2>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
        <hr />
        <form action={formAddPlayer}>
          <div className="flex gap-2">
            <Input type="text" name="name" />
            <Button type="submit">Add Player</Button>
          </div>
        </form>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Games</h2>
        <ul>
          {games.map((game) => (
            <li key={game.id}>{new Date(game.date).toLocaleDateString()}</li>
          ))}
        </ul>
        <hr />
        <form action={formAddGame}>
          <div className="flex gap-2">
            <DatePicker />
            <Button type="submit">Add Game</Button>
          </div>
        </form>
      </section>
    </main>
  );
}
