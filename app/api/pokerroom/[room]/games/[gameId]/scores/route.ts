import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const scoreSchema = z.object({
  scores: z.array(
    z.object({
      playerId: z.string(),
      buyins: z.number(),
      stack: z.number(),
    })
  ),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ room: string; gameId: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const { room: roomId, gameId } = await params;

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

    // Validate request body
    const body = await request.json();
    const validatedData = scoreSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validatedData.error.errors },
        { status: 400 }
      );
    }

    // Verify all players exist in the game
    const invalidPlayers = validatedData.data.scores.filter(
      (score) => !game.players.some((player) => player.id === score.playerId)
    );

    if (invalidPlayers.length > 0) {
      return NextResponse.json(
        {
          message: "Some players are not in this game",
          players: invalidPlayers.map((p) => p.playerId),
        },
        { status: 400 }
      );
    }

    // Update scores in a transaction
    const updatedGame = await prisma.$transaction(async (tx) => {
      // Update each score
      await Promise.all(
        validatedData.data.scores.map((score) =>
          tx.score.upsert({
            where: {
              gameId_playerId: {
                gameId,
                playerId: score.playerId,
              },
            },
            create: {
              gameId,
              playerId: score.playerId,
              buyins: score.buyins,
              stack: score.stack,
            },
            update: {
              buyins: score.buyins,
              stack: score.stack,
            },
          })
        )
      );

      // Return updated game with all related data
      return tx.game.findUnique({
        where: { id: gameId },
        include: {
          players: true,
          scores: {
            include: {
              player: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game scores:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
