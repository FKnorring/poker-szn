import { Player, Score } from "@prisma/client";

export function getNonAssignedPlayers(
  allPlayers: Player[],
  attendingPlayers: Player[]
) {
  return allPlayers.filter(
    ({ id }) => !attendingPlayers.some((p) => p.id === id)
  );
}

export type ExtendedPlayer = Player & { score: number };

export function getPlayerScores(
  scores: Score[],
  players: Player[]
): ExtendedPlayer[] {
  return players.map((player) => {
    const score = scores.find((score) => score.playerId === player.id);
    return {
      ...player,
      score: score?.score || 0,
    };
  });
}
