import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ room: string; playerId: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { room: roomId, playerId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the room and check permissions
    const room = await prisma.pokerRoom.findUnique({
      where: { id: roomId },
      include: { managers: true },
    });

    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }

    // Check if user is creator or manager
    const isCreatorOrManager =
      room.creatorId === user.id ||
      room.managers.some((manager) => manager.userId === user.id);

    if (!isCreatorOrManager) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if player exists and belongs to this room
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return new NextResponse("Player not found", { status: 404 });
    }

    if (player.roomId !== roomId) {
      return new NextResponse("Player not found in this room", { status: 404 });
    }

    await prisma.player.delete({
      where: { id: playerId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
