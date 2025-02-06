import { notFound } from "next/navigation";
import { canEditRoom, getRoomData } from "./actions";
import Header from "@/components/header";
import RoomCharts from "@/components/room-charts";
import RoomPasswordInput from "@/components/room-password-input";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room: roomId } = await params;
  const roomData = await getRoomData(roomId);

  if (!roomData) {
    notFound();
  }

  const canEdit = await canEditRoom(roomId);
  const { room, games, players, totalBuyin, hasPasswordAccess } = roomData;

  console.log(games[0]);

  return (
    <>
      <Header editLink={canEdit ? `/pokerroom/${room.id}/edit` : undefined} />
      <main className="container mx-auto px-4">
        <div className="space-y-8">
          {room.password && !hasPasswordAccess && (
            <div className="mt-4">
              <RoomPasswordInput roomId={room.id} />
            </div>
          )}
          <RoomCharts
            room={room}
            totalBuyin={totalBuyin}
            seasons={room.seasons}
            games={games}
            players={players}
            currency={room.currency}
          />
        </div>
      </main>
    </>
  );
}
