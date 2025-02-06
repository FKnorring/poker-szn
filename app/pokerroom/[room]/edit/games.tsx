"use client";
import {
  Game,
  Player,
  Score,
  Season,
  PokerRoom,
  RoomManager,
  User,
} from "@prisma/client";
import { EditGameProvider } from "./context";
import { PlayerWithCount } from "./utils";
import GameManagement from "./components/game-management";
import SeasonManagement from "./components/season-management";
import RoomManagement from "./components/room-management";
import PlayerManagement from "./components/player-management";
import ManagerManagement from "./components/manager-management";
import {
  updateSeasonName,
  updateRoom,
  createSeason,
  createPlayer,
  removePlayer,
} from "./api";

export type ExtendedGame = Game & {
  players: Player[];
  scores: Score[];
  season: Season;
};

interface RoomManagerWithUser extends RoomManager {
  user: User;
}

interface GamesProps {
  games: ExtendedGame[];
  players: PlayerWithCount[];
  seasons: Season[];
  roomId: string;
  room: PokerRoom;
  managers: RoomManagerWithUser[];
  isCreator: boolean;
}

export default function Games({
  games,
  players,
  seasons,
  roomId,
  room,
  managers,
  isCreator,
}: GamesProps) {
  return (
    <EditGameProvider values={{ players, setPlayers: () => {} }}>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto">
        <GameManagement
          games={games}
          room={room}
          seasonId={seasons[0].id}
          seasons={seasons}
        />
        <div className="w-full md:w-[300px] flex-shrink-0">
          <RoomManagement room={room} onRoomUpdate={updateRoom} />
          <ManagerManagement
            roomId={roomId}
            managers={managers}
            isCreator={isCreator}
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
