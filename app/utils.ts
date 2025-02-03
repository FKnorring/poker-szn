import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CURRENT } from "@/config/season";

const CURRENT_SEASON = CURRENT.id;

export function revalidateAll() {
  revalidatePath("/", "layout");
}

export function getPlayers(season?: number, allSeasons: boolean = false) {
  const prisma = new PrismaClient();
  return prisma.player.findMany({
    where: allSeasons
      ? undefined
      : {
          Games: {
            some: {
              season,
            },
          },
        },
    include: {
      _count: {
        select: {
          Games: true,
        },
      },
    },
    orderBy: {
      Games: {
        _count: "desc",
      },
    },
  });
}

export function getGames(
  season: number = CURRENT_SEASON,
  allSeasons: boolean = false
) {
  const prisma = new PrismaClient();
  return prisma.game.findMany({
    where: allSeasons ? undefined : { season },
    include: { players: true, scores: true },
    orderBy: { date: "desc" },
  });
}

export function getScores() {
  const prisma = new PrismaClient();
  return prisma.score.findMany();
}

export function getGame(id: number) {
  const prisma = new PrismaClient();
  return prisma.game.findUnique({
    where: { id },
  });
}

export async function addPlayer(name: string) {
  const prisma = new PrismaClient();
  const res = await prisma.player.create({
    data: {
      name,
    },
  });
  revalidateAll();
  return res;
}

export async function addGame(date: Date) {
  const prisma = new PrismaClient();
  const res = await prisma.game.create({
    data: {
      date,
      season: CURRENT_SEASON,
    },
  });
  revalidateAll();
  return res;
}

export async function addNewPlayerToGame(name: string, gameId: number) {
  const player = await addPlayer(name);
  const { game, score } = await addPlayerToGame(player.id, gameId);
  revalidateAll();
  return { player, game, score };
}

export async function addPlayerToGame(playerId: number, gameId: number) {
  const prisma = new PrismaClient();
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

export async function removeGame(id: number) {
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

export async function removePlayerFromGame(playerId: number, gameId: number) {
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
  scores: { playerId: number; buyins: number; stack: number }[],
  gameId: number
) {
  const prisma = new PrismaClient();

  const transactions = scores.map(({ playerId, buyins, stack }) =>
    prisma.score.update({
      where: {
        playerId_gameId: {
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
  playerId: number;
  buyins: number;
  stack: number;
  gameId: number;
}) {
  const prisma = new PrismaClient();
  const res = await prisma.score.update({
    where: {
      playerId_gameId: {
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

export function getTotalBuyin() {
  const prisma = new PrismaClient();
  return prisma.score
    .aggregate({
      _sum: {
        buyins: true,
      },
    })
    .then((res) => res._sum.buyins || 0);
}
