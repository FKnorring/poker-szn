import { Player, Score } from "@prisma/client";

export function getNonAssignedPlayers(
  allPlayers: Player[],
  attendingPlayers: Player[]
) {
  const attendingSet = new Set(attendingPlayers.map((p) => p.id));
  return allPlayers.filter(({ id }) => !attendingSet.has(id));
}

export type ExtendedPlayer = Player & { buyins: number; stack: number };

export function getPlayerScores(
  scores: Score[],
  players: Player[]
): ExtendedPlayer[] {
  return players.map((player) => {
    const score = scores.find((score) => score.playerId === player.id);
    return {
      ...player,
      buyins: score?.buyins || 0,
      stack: score?.stack || 0,
    };
  });
}

export const getGameMoney = (scoredPlayers: ExtendedPlayer[]) => {
  const moneyIn = scoredPlayers.reduce(
    (acc, player) => acc + player.buyins * 100,
    0
  );
  const moneyOut = scoredPlayers.reduce((acc, player) => acc + player.stack, 0);
  return { moneyIn, moneyOut };
};
