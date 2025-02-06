import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ room: string }> }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { room: roomId } = await params;

  const room = await prisma.pokerRoom.findUnique({
    where: { id: roomId },
    include: {
      managers: {
        include: {
          user: true,
        },
      },
    },
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

  return NextResponse.json(room.managers);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ room: string }> }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const { room: roomId } = await params;

  if (!user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const room = await prisma.pokerRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return new NextResponse("Room not found", { status: 404 });
  }

  // Only creator can add managers
  if (room.creatorId !== user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { email } = await request.json();

  // Find user by email
  const userToAdd = await prisma.user.findUnique({
    where: { email },
  });

  if (!userToAdd) {
    return new NextResponse("User not found", { status: 404 });
  }

  // Check if user is already a manager
  const existingManager = await prisma.roomManager.findUnique({
    where: {
      userId_roomId: {
        userId: userToAdd.id,
        roomId: room.id,
      },
    },
  });

  if (existingManager) {
    return new NextResponse("User is already a manager", { status: 400 });
  }

  const manager = await prisma.roomManager.create({
    data: {
      userId: userToAdd.id,
      roomId: room.id,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json(manager);
}
