import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { room: string; managerId: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const room = await prisma.pokerRoom.findUnique({
    where: { id: params.room },
  });

  if (!room) {
    return new NextResponse("Room not found", { status: 404 });
  }

  // Only creator can remove managers
  if (room.creatorId !== user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const manager = await prisma.roomManager.findUnique({
    where: { id: params.managerId },
  });

  if (!manager) {
    return new NextResponse("Manager not found", { status: 404 });
  }

  // Verify the manager belongs to this room
  if (manager.roomId !== room.id) {
    return new NextResponse("Manager not found in this room", { status: 404 });
  }

  await prisma.roomManager.delete({
    where: { id: params.managerId },
  });

  return new NextResponse(null, { status: 204 });
}
