import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CURRENT } from "@/config/season";
import prisma from "@/lib/prisma";

const CURRENT_SEASON = CURRENT.id;

export function revalidateAll() {
  revalidatePath("/", "layout");
}

export function getPlayers(roomId: string, seasonId?: string) {
  return prisma.player.findMany({
    where: {
      roomId,
      games: {
        some: {
          roomId,
          seasonId,
        },
      },
    },
    include: {
      _count: {
        select: {
          games: true,
        },
      },
    },
    orderBy: {
      games: {
        _count: "desc",
      },
    },
  });
}

export function getGames(roomId: string, seasonId?: string) {
  return prisma.game.findMany({
    where: {
      roomId,
      seasonId,
    },
    include: {
      players: true,
      scores: { include: { player: true } },
      season: true,
    },
    orderBy: { date: "desc" },
  });
}

export function getRoom(roomId: string) {
  return prisma.pokerRoom.findUnique({
    where: { id: roomId },
    include: {
      seasons: true,
      managers: { include: { user: true } },
    },
  });
}

export function getSeasons(roomId: string) {
  return prisma.season.findMany({
    where: {
      roomId,
    },
    orderBy: {
      startDate: "desc",
    },
  });
}

export function getScores() {
  return prisma.score.findMany();
}

export function getGame(id: string) {
  return prisma.game.findUnique({
    where: { id },
  });
}

export async function addPlayer(name: string, roomId: string) {
  const res = await prisma.player.create({
    data: {
      name,
      room: {
        connect: {
          id: roomId,
        },
      },
    },
  });
  revalidateAll();
  return res;
}

export async function addGame(date: Date, seasonId: string, roomId: string) {
  const res = await prisma.game.create({
    data: {
      date,
      season: {
        connect: {
          id: seasonId,
        },
      },
      room: {
        connect: {
          id: roomId,
        },
      },
    },
  });

  revalidateAll();
  return res;
}

export async function addNewPlayerToGame(
  name: string,
  gameId: string,
  roomId: string
) {
  const player = await addPlayer(name, roomId);
  const { game, score } = await addPlayerToGame(player.id, gameId);
  revalidateAll();
  return { player, game, score };
}

export async function addPlayerToGame(playerId: string, gameId: string) {
  const game = await prisma.game.update({
    where: { id: gameId },

    data: {
      players: {
        connect: {
          id: playerId,
        },
      },
    },
  });
  const score = await prisma.score.create({
    data: {
      buyins: 1,
      stack: 100,
      game: {
        connect: {
          id: gameId,
        },
      },
      player: {
        connect: {
          id: playerId,
        },
      },
    },
  });
  revalidateAll();
  return { game, score };
}

export async function removeGame(id: string) {
  const prisma = new PrismaClient();
  const score = await prisma.score.deleteMany({
    where: { gameId: id },
  });
  const game = await prisma.game.delete({
    where: { id },
  });
  revalidateAll();
  return { game, score };
}

export async function removePlayerFromGame(playerId: string, gameId: string) {
  const prisma = new PrismaClient();
  const game = await prisma.game.update({
    where: { id: gameId },

    data: {
      players: {
        disconnect: {
          id: playerId,
        },
      },
    },
  });
  const score = await prisma.score.deleteMany({
    where: {
      playerId,
      gameId,
    },
  });
  revalidateAll();
  return { game, score };
}

export async function updateScores(
  scores: { playerId: string; buyins: number; stack: number }[],
  gameId: string
) {
  const prisma = new PrismaClient();

  const transactions = scores.map(({ playerId, buyins, stack }) =>
    prisma.score.update({
      where: {
        gameId_playerId: {
          gameId,
          playerId,
        },
      },
      data: {
        buyins,
        stack,
      },
    })
  );
  const res = await prisma.$transaction(transactions);
  revalidateAll();
  return res;
}

export async function updateScore({
  playerId,
  buyins,
  stack,
  gameId,
}: {
  playerId: string;
  buyins: number;
  stack: number;
  gameId: string;
}) {
  const prisma = new PrismaClient();
  const res = await prisma.score.update({
    where: {
      gameId_playerId: {
        gameId,
        playerId,
      },
    },
    data: {
      buyins,
      stack,
    },
  });
  revalidateAll();
  return res;
}

export function fetchLatestGame() {
  const prisma = new PrismaClient();
  return prisma.game.findFirst({
    include: { players: true, scores: true },
    orderBy: {
      date: "desc",
    },
  });
}

export function getTotalBuyin(roomId: string) {
  return prisma.score
    .aggregate({
      where: {
        game: {
          roomId,
        },
      },

      _sum: {
        buyins: true,
      },
    })
    .then((res) => res._sum.buyins || 0);
}
