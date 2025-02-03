import { getGames, getPlayers, getTotalBuyin } from "../utils";
import { ALL_SEASONS, CURRENT } from "@/config/season";
import { redirect } from "next/navigation";

export async function getPageData(seasonParam?: string) {
  // If no season param, use current season
  if (!seasonParam) {
    const games = await getGames();
    const players = await getPlayers(CURRENT.id);
    const totalBuyin = await getTotalBuyin();
    return { games, players, totalBuyin };
  }

  // Validate season param
  const isValidSeason =
    seasonParam === "all" ||
    ALL_SEASONS.some((s) => s.id.toString() === seasonParam);
  if (!isValidSeason) {
    redirect("/");
  }

  // Get data for specific season
  const seasonNumber = parseInt(seasonParam, 10);
  const games = await getGames(seasonNumber, seasonParam === "all");
  const players = await getPlayers(seasonNumber, seasonParam === "all");
  const totalBuyin = await getTotalBuyin();

  return { games, players, totalBuyin };
}
