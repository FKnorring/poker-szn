import { notFound } from "next/navigation";
import { canEditRoom, getRoomData } from "./actions";
import Header from "@/components/header";
import RoomCharts from "@/components/room-charts";

export default async function RoomPage({
  params,
}: {
  params: { room: string };
}) {
  const roomId = params.room;
  const roomData = await getRoomData(roomId);

  if (!roomData) {
    notFound();
  }

  const canEdit = await canEditRoom(roomId);
  const { room, games, players, totalBuyin } = roomData;

  return (
    <>
      <Header editLink={canEdit ? `/pokerroom/${room.id}/edit` : undefined} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center">
            <div className="mr-8">
              <h1 className="text-3xl font-bold">{room.name}</h1>
              <p className="text-muted-foreground">
                Total buyin: {room.currency} {totalBuyin}
              </p>
            </div>
          </div>
          <RoomCharts
            roomId={room.id}
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
