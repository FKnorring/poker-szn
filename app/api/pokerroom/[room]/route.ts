import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateRoomSchema = z.object({
  name: z.string().min(3).max(50),
  currency: z.enum(["€", "$", "£", "kr"]),
  defaultBuyIn: z.number().min(1).max(1000000),
});

export async function PATCH(
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
    const validatedData = updateRoomSchema.safeParse(body);

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

    const updatedRoom = await prisma.pokerRoom.update({
      where: { id: params.room },
      data: {
        name: validatedData.data.name,
        currency: validatedData.data.currency,
        defaultBuyIn: validatedData.data.defaultBuyIn,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
