import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createRoomSchema = z.object({
  name: z.string().min(3).max(50),
  currency: z.enum(["€", "$", "£", "kr"]),
  defaultBuyIn: z.number().min(1).max(1000000),
  password: z.string().optional(),
  creatorId: z.string(),
});

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to create a room" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { message: "Invalid request: Missing request body" },
        { status: 400 }
      );
    }

    // Validate request data
    const validatedData = createRoomSchema.safeParse(body);

    if (!validatedData.success) {
      console.error("Validation errors:", validatedData.error.errors);
      return NextResponse.json(
        {
          message: "Invalid request data",
          errors: validatedData.error.errors,
        },
        { status: 422 }
      );
    }

    // Verify that the creatorId matches the authenticated user
    if (validatedData.data.creatorId !== user.id) {
      return NextResponse.json(
        {
          message: "Unauthorized: Creator ID does not match authenticated user",
        },
        { status: 401 }
      );
    }

    // Create the room
    const room = await prisma.pokerRoom.create({
      data: {
        name: validatedData.data.name,
        currency: validatedData.data.currency,
        defaultBuyIn: validatedData.data.defaultBuyIn,
        password: validatedData.data.password,
        creatorId: validatedData.data.creatorId,
      },
    });

    // Create initial season with same name as room
    await prisma.season.create({
      data: {
        name: validatedData.data.name,
        roomId: room.id,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating room:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
