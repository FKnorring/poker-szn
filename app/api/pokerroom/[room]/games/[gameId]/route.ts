import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateGameSchema = z.object({
  seasonId: z.string().optional(),
  buyIn: z.number().min(1).optional(),
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

    const body = await request.json();
    const validatedData = updateGameSchema.safeParse(body);

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

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (game.roomId !== roomId) {
      return new NextResponse("Game not found in this room", { status: 404 });
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        seasonId: validatedData.data.seasonId,
        buyIn: validatedData.data.buyIn,
      },
      include: {
        players: true,
        scores: true,
        season: true,
      },
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (game.roomId !== roomId) {
      return new NextResponse("Game not found in this room", { status: 404 });
    }

    // Delete the game and all related records
    await prisma.$transaction([
      prisma.score.deleteMany({
        where: { gameId: gameId },
      }),
      prisma.game.delete({
        where: { id: gameId },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
