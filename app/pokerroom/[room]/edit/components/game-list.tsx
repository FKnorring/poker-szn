"use client";

import { ExtendedGame } from "../games";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ListGame from "./list-game";
import GameDetails from "./game-details";
import { PokerRoom, Season } from "@prisma/client";

interface GameListProps {
  games: ExtendedGame[];
  selectedGame: string | null;
  onGameSelect: (gameId: string) => void;
  onGameRemoved: (gameId: string) => void;
  room: PokerRoom;
  seasons: Season[];
}

export default function GameList({
  games,
  selectedGame,
  onGameSelect,
  onGameRemoved,
  room,
  seasons,
}: GameListProps) {
  return (
    <div className="flex flex-col gap-2">
      {games.map((game) => (
        <Collapsible
          key={game.id}
          className="border py-2 lg:py-4 px-2 lg:px-6 rounded-md flex flex-col shadow-sm"
          open={game.id === selectedGame}
        >
          <CollapsibleTrigger
            role="button"
            onClick={() => onGameSelect(game.id)}
            className="w-full flex gap-2 justify-between items-center"
          >
            <ListGame game={game} />
            {game.id === selectedGame ? <ChevronDown /> : <ChevronRight />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <GameDetails
              game={game}
              onGameRemoved={onGameRemoved}
              room={room}
              seasons={seasons}
            />
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
