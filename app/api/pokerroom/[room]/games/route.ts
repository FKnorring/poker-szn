import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createGameSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  seasonId: z.string(),
  buyIn: z.number().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { room: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = createGameSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validatedData.error.errors },
        { status: 422 }
      );
    }

    // Get the room and check permissions
    const room = await prisma.pokerRoom.findUnique({
      where: { id: params.room },
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

    // Create the game
    const game = await prisma.game.create({
      data: {
        date: validatedData.data.date,
        roomId: params.room,
        seasonId: validatedData.data.seasonId,
        buyIn: validatedData.data.buyIn ?? room.defaultBuyIn,
      },
      include: {
        players: true,
        scores: true,
        season: true,
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
