import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getRoomData(roomId: string) {
  const room = await prisma.pokerRoom.findUnique({
    where: {
      id: roomId,
    },
    include: {
      seasons: {
        orderBy: {
          startDate: "desc",
        },
      },
    },
  });

  if (!room) {
    return null;
  }

  // Get all games for the latest season
  const games = await prisma.game.findMany({
    where: {
      roomId: room.id,
    },
    include: {
      scores: {
        include: {
          player: true,
        },
      },
      players: true,
      season: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Get all players in the room
  const players = await prisma.player.findMany({
    where: {
      roomId: room.id,
    },
  });

  // Calculate total buyin for the season
  const totalBuyin = games.reduce((total, game) => {
    return (
      total +
      game.scores.reduce((gameTotal, score) => {
        return gameTotal + score.buyins * game.buyIn;
      }, 0)
    );
  }, 0);

  return { room, games, players, totalBuyin };
}

export async function canEditRoom(roomId: string) {
  const { isAuthenticated, getUser } = getKindeServerSession();

  console.log("authenticaing...");

  if (!(await isAuthenticated())) {
    console.log("not authenticated");
    return false;
  }

  const user = await getUser();
  const room = await prisma.pokerRoom.findUnique({
    where: { id: roomId },
    include: {
      managers: true,
    },
  });

  console.log(room);
  console.log(user);

  return (
    room?.creatorId === user?.id ||
    room?.managers.some((manager) => manager.userId === user?.id)
  );
}
