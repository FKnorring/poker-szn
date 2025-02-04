"use client";
import { Game, Player, Score, Season, PokerRoom } from "@prisma/client";
import { useState } from "react";
import { EditGameProvider } from "./context";
import { PlayerWithCount } from "./utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Zap } from "lucide-react";
import { handleAddGame, updateSeasonName, updateRoom, createSeason, createPlayer, removePlayer } from "./api";
import { DatePicker } from "@/components/ui/datepicker";
import GameDetails from "./components/game-details";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ListGame from "./components/list-game";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SeasonManagement from "./components/season-management";
import RoomManagement from "./components/room-management";
import PlayerManagement from "./components/player-management";

export type ExtendedGame = Game & {
  players: Player[];
  scores: Score & { player: Player }[];
  season: Season;
};

interface GamesProps {
  games: ExtendedGame[];
  players: PlayerWithCount[];
  seasons: Season[];
  roomId: string;
  room: PokerRoom;
}

export default function Games({
  games,
  players,
  seasons,
  roomId,
  room,
}: GamesProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [_players, setPlayers] = useState(players);
  const [_games, setGames] = useState(games);
  const [selectedDate, setSelectedDate] = useState<Date>();

  function selectGame(gameId: string) {
    if (gameId === selectedGame) {
      setSelectedGame(null);
      return;
    }
    setSelectedGame(gameId);
  }

  async function handleAddNewGame() {
    if (!selectedDate) return;
    const game = await handleAddGame(
      new Date(selectedDate).toISOString().split("T")[0],
      roomId,
      seasons[0].id
    );
    const newGame = {
      ...game,
      players: [],
      scores: [],
      season: seasons[0],
    } as unknown as ExtendedGame;
    setGames((games) =>
      [newGame, ...games].sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    setSelectedGame(game.id);
    toast("Game has been added!", {
      description: new Date(selectedDate).toLocaleDateString("sv-SE"),
    });
  }

  async function handleQuickAddGame() {
    const today = new Date().toISOString().split("T")[0];
    const game = await handleAddGame(today, roomId, seasons[0].id);
    const newGame = {
      ...game,
      players: [],
      scores: [],
      season: seasons[0],
    } as unknown as ExtendedGame;
    setGames((games) =>
      [newGame, ...games].sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    setSelectedGame(game.id);
    toast("Game has been added!", {
      description: "Today&apos;s date: " + new Date().toLocaleDateString("sv-SE"),
    });
  }

  function handleGameRemoved(gameId: string) {
    setGames((games) => games.filter((game) => game.id !== gameId));
    if (selectedGame === gameId) {
      setSelectedGame(null);
    }
  }

  return (
    <EditGameProvider values={{ players: _players, setPlayers }}>
      <div className="flex gap-8 w-full max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleQuickAddGame}
                    variant="default"
                    className="flex items-center justify-center gap-1"
                  >
                    Quick add game <Zap size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Creates a new game for today&apos;s date</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DatePicker
              className="max-w-[150px] ml-auto"
              value={selectedDate}
              onChange={setSelectedDate}
            />
            <Button
              onClick={handleAddNewGame}
              variant="secondary"
              className="flex items-center justify-center gap-1"
              disabled={!selectedDate}
            >
              Add game <Plus size={16} />
            </Button>
          </div>
          <div className="flex flex-col gap-2 pb-10">
            {_games.map((game) => (
              <Collapsible
                key={game.id}
                className="border py-2 lg:py-4 px-2 lg:px-6 rounded-md flex flex-col shadow-sm"
                open={game.id === selectedGame}
              >
                <CollapsibleTrigger
                  role="button"
                  onClick={() => selectGame(game.id)}
                  className="w-full flex gap-2 justify-between items-center"
                >
                  <ListGame game={game} />
                  {game.id === selectedGame ? <ChevronDown /> : <ChevronRight />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <GameDetails game={game} onGameRemoved={handleGameRemoved} />
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
        <div className="w-[300px] flex-shrink-0">
          <RoomManagement 
            room={room} 
            onRoomUpdate={updateRoom}
          />
          <SeasonManagement 
            seasons={seasons} 
            onSeasonUpdate={updateSeasonName}
            onSeasonCreate={(data) => createSeason(roomId, data)}
            roomId={roomId}
          />
          <PlayerManagement 
            players={players}
            onPlayerCreate={(name) => createPlayer(roomId, name)}
            onPlayerRemove={(playerId) => removePlayer(roomId, playerId)}
          />
        </div>
      </div>
    </EditGameProvider>
  );
}
