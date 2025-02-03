import { notFound } from "next/navigation";
import PageLayout from "@/components/page-layout";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { canEditRoom, getRoomData } from "./actions";

export default async function RoomPage({
  params,
}: {
  params: { room: string };
}) {
  const roomId = await params.room;
  const roomData = await getRoomData(roomId);

  if (!roomData) {
    notFound();
  }

  const canEdit = await canEditRoom(roomId);

  const { room, games, players, totalBuyin } = roomData;

  return (
    <PageLayout
      games={games}
      players={players}
      totalBuyin={totalBuyin}
      room={room}
      showEditButton={canEdit}
      showSeasonSelector
      currentSeasonId={room.seasons[0]?.id}
    />
  );
}
