import { PrismaClient } from "@prisma/client";

export function getPlayers() {
  const prisma = new PrismaClient();
  return prisma.player.findMany();
}

export function getGames() {
  const prisma = new PrismaClient();
  return prisma.game.findMany({
    include: { players: true, scores: true },
  });
}

export function getGame(id: number) {
  const prisma = new PrismaClient();
  return prisma.game.findUnique({
    where: { id },
  });
}

export function addPlayer(name: string) {
  const prisma = new PrismaClient();
  return prisma.player.create({
    data: {
      name,
    },
  });
}

export function addGame(date: Date) {
  const prisma = new PrismaClient();
  return prisma.game.create({
    data: {
      date,
    },
  });
}

export async function addNewPlayerToGame(name: string, gameId: number) {
  const player = await addPlayer(name);
  const { game, score } = await addPlayerToGame(player.id, gameId);
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
  return { game, score };
}

export function removePlayerFromGame(playerId: number, gameId: number) {
  const prisma = new PrismaClient();
  const game = prisma.game.update({
    where: { id: gameId },
    data: {
      players: {
        disconnect: {
          id: playerId,
        },
      },
    },
  });
  const score = prisma.score.deleteMany({
    where: {
      playerId,
      gameId,
    },
  });
  return { game, score };
}

export function updateScores(
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

  return prisma.$transaction(transactions);
}
