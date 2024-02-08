import { Game } from "@prisma/client";

export default function ListGame({ game }: { game: Game }) {
  return (
    <div className="flex">
      <h2>{game.date.toLocaleDateString("sv-SE")}</h2>
    </div>
  );
}
