import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createSeasonSchema = z.object({
  name: z.string().min(3).max(50),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ room: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { room: roomId } = await params;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSeasonSchema.safeParse(body);

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

    const season = await prisma.season.create({
      data: {
        name: validatedData.data.name,
        startDate: validatedData.data.startDate,
        endDate: validatedData.data.endDate,
        roomId,
      },
    });

    return NextResponse.json(season);
  } catch (error) {
    console.error("Error creating season:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
