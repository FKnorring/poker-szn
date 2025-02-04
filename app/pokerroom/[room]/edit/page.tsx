import { getGames, getPlayers, getRoom, getSeasons } from "@/app/utils";
import Games from "./games";
import Header from "@/components/header";
import { canEditRoom } from "../actions";

export default async function EditGames({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  const canEdit = await canEditRoom(room);

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center h-full gap-4 flex-col">
        <p>You are not authorized to edit this poker room.</p>
      </div>
    );
  }

  const games = await getGames(room);
  const players = await getPlayers(room);
  const seasons = await getSeasons(room);
  const dbRoom = await getRoom(room);
  return (
    <>
      <Header statsLink={`/pokerroom/${room}`} />
      <Games
        games={games}
        players={players}
        seasons={seasons}
        roomId={room}
        room={dbRoom}
      />
    </>
  );
}
