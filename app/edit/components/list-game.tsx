import { Game } from "@prisma/client";
import { ExtendedGame } from "../games";
import { User } from "lucide-react";
import { getGameMoney, getPlayerScores } from "../utils";

export default function ListGame({ game }: { game: ExtendedGame }) {
  const { moneyIn, moneyOut } = getGameMoney(
    getPlayerScores(game.scores, game.players)
  );
  return (
    <div className="flex flex-grow justify-between pe-2">
      <h2>{game.date.toLocaleDateString("sv-SE")}</h2>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <span className="text-green-500">{moneyIn}</span>+/-
          <span className="text-red-500">{moneyOut}</span>
        </div>
        <div className="flex items-center">
          {game.players.length} <User size={16} />
        </div>
      </div>
    </div>
  );
}
