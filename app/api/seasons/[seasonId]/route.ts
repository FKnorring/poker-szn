import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateSeasonSchema = z.object({
  name: z.string().min(3).max(50),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { seasonId } = await params;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateSeasonSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validatedData.error.errors },
        { status: 422 }
      );
    }

    // Get the season and check permissions
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { room: { include: { managers: true } } },
    });

    if (!season) {
      return new NextResponse("Season not found", { status: 404 });
    }

    // Check if user is creator or manager
    const isCreatorOrManager =
      season.room.creatorId === user.id ||
      season.room.managers.some((manager) => manager.userId === user.id);

    if (!isCreatorOrManager) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedSeason = await prisma.season.update({
      where: { id: seasonId },
      data: {
        name: validatedData.data.name,
        startDate: validatedData.data.startDate,
        endDate: validatedData.data.endDate,
      },
    });

    return NextResponse.json(updatedSeason);
  } catch (error) {
    console.error("Error updating season:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
