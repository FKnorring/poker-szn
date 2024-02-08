import { Game } from "@prisma/client";
import { ExtendedGame } from "../games";
import { User } from "lucide-react";

export default function ListGame({ game }: { game: ExtendedGame }) {
  return (
    <div className="flex flex-grow justify-between pe-2">
      <h2>{game.date.toLocaleDateString("sv-SE")}</h2>
      <div className="flex items-center gap-4">
        +/-
        <div className="flex items-center">
          {game.players.length} <User size={16} />
        </div>
      </div>
    </div>
  );
}
