import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getRoomPasswordCookie } from "@/lib/cookies";

export async function checkRoomPassword(roomId: string, password: string): Promise<boolean> {
  const room = await prisma.pokerRoom.findUnique({
    where: { id: roomId },
    select: { password: true }
  });

  if (!room?.password) return true;
  return password === room.password;
}

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

  // Check if room is password protected and user has access
  const { canEdit } = await canEditRoom(roomId);
  const storedPassword = await getRoomPasswordCookie(roomId);
  const hasPasswordAccess = !room.password ||
    canEdit ||
    (storedPassword === room.password);

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

  const idToName: { [key: string]: string } = {};
  // If no password access, obfuscate player names
  if (!hasPasswordAccess) {
    players.forEach((player, index) => {
      const name = player.name;
      player.name = `Player ${index + 1}`;
      idToName[player.id] = name;
    });
  }

  return {
    room, 
    games: games.map(game => {
      if (hasPasswordAccess) {
        return game;
      }
      return {
        ...game,
        scores: game.scores.map((score, index) => ({
          ...score,
          player: {
            ...score.player,
            name: idToName[score.player.id] || `Player ${index + 1}`
          }
        })),
        players: game.players.map((player, index) => ({
          ...player,
          name: idToName[player.id] || `Player ${index + 1}`
        }))
      }
    }), 
    players, 
    totalBuyin, 
    hasPasswordAccess
  };
}

export async function canEditRoom(roomId: string) {
  const { isAuthenticated, getUser } = getKindeServerSession();

  console.log("authenticaing...");

  if (!(await isAuthenticated())) {
    console.log("not authenticated");
    return { canEdit: false, isCreator: false };
  }

  const user = await getUser();
  const room = await prisma.pokerRoom.findUnique({
    where: { id: roomId },
    include: {
      managers: true,
    },
  });

  const isManager = room?.managers.some(
    (manager) => manager.userId === user?.id
  );

  const isCreator = room?.creatorId === user?.id;

  return {
    canEdit: isCreator || isManager,
    isCreator,
  };
}
