import prisma from "@/lib/prisma";
import { getGames, getPlayers, getTotalBuyin } from "../utils";

export async function getPageData(roomId: string, seasonId?: string) {
  let _seasonId = seasonId;
  // If no season param, use current season
  if (!seasonId) {
    const latestSeason = await prisma.season.findFirst({
      where: {
        roomId,
      },
      select: {
        id: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });
    if (!latestSeason) {
      throw new Error("No season found");
    }
    _seasonId = latestSeason.id;
  }

  if (_seasonId === "all") {
    _seasonId = undefined;
  }

  const games = await getGames(roomId, _seasonId);
  const players = await getPlayers(roomId, _seasonId);
  const totalBuyin = await getTotalBuyin(roomId);

  return { games, players, totalBuyin };
}
