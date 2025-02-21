import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const addPlayerSchema = z
  .object({
    playerId: z.string().optional(),
    name: z.string().min(2).max(50).optional(),
  })
  .refine((data) => data.playerId || data.name, {
    message: "Either playerId or name must be provided",
  });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ room: string; gameId: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { room: roomId, gameId } = await params;

    const body = await request.json();
    const validatedData = addPlayerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validatedData.error.errors },
        { status: 422 }
      );
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

    let player;

    // If playerId is provided, add existing player
    if (validatedData.data.playerId) {
      player = await prisma.player.findUnique({
        where: { id: validatedData.data.playerId },
      });

      if (!player) {
        return new NextResponse("Player not found", { status: 404 });
      }

      console.log(roomId, player.roomId);

      if (player.roomId !== roomId) {
        return new NextResponse("Player not found in this room", {
          status: 404,
        });
      }

      // Check if player is already in the game
      if (game.players.some((p) => p.id === player!.id)) {
        return new NextResponse("Player already in game", { status: 400 });
      }
    } else {
      // Create new player if name is provided
      player = await prisma.player.create({
        data: {
          name: validatedData.data.name!,
          roomId: roomId,
        },
      });
    }

    // Add player to game and create initial score
    const updatedGame = await prisma.$transaction(async (tx) => {
      // Add player to game
      const game = await tx.game.update({
        where: { id: gameId },
        data: {
          players: {
            connect: { id: player!.id },
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

      // Create initial score for player
      await tx.score.create({
        data: {
          gameId: gameId,
          playerId: player!.id,
          buyins: 1,
          stack: 100,
        },
      });

      return game;
    });

    return NextResponse.json({ player, game: updatedGame });
  } catch (error) {
    console.error("Error adding player to game:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
