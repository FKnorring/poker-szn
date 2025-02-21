import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  {
    params,
  }: { params: Promise<{ room: string; gameId: string; playerId: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const { room: roomId, gameId, playerId } = await params;

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

    // Get the game and verify it belongs to the room
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (game.roomId !== roomId) {
      return new NextResponse("Game not found in this room", { status: 404 });
    }

    // Check if player exists and is in the game
    const playerInGame = game.players.some((player) => player.id === playerId);

    if (!playerInGame) {
      return new NextResponse("Player not found in this game", { status: 404 });
    }

    // Remove player from game and delete their scores in a transaction
    const updatedGame = await prisma.$transaction(async (tx) => {
      // Delete scores first
      await tx.score.deleteMany({
        where: {
          gameId: gameId,
          playerId: playerId,
        },
      });

      // Remove player from game
      const game = await tx.game.update({
        where: { id: gameId },
        data: {
          players: {
            disconnect: { id: playerId },
          },
        },
        include: {
          players: true,
          scores: {
            include: {
              player: true,
            },
          },
        },
      });

      return game;
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error removing player from game:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
