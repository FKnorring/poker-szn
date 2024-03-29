import { ExtendedGame } from "@/app/edit/games";
import { Player } from "@prisma/client";

type PlayerNames = {
  [id: string]: string;
};

type PlayerData = {
  [name: string]: number;
};

type GameData = {
  name: string;
} & PlayerData;

export function stringToColorHash(name: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert the hash to a 6-digit hexadecimal code
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }

  return color;
}

export function extractTotals(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, { name, id }) => {
    return { [id]: name, ...acc };
  }, {});
  const data: GameData[] = [...new Array(games.length)];

  games
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach((game, i) => {
      const players: PlayerData = Object.values(playerNames).reduce(
        (acc, name) => {
          return { [name]: 0, ...acc };
        },
        {}
      );
      if (i !== 0) {
        const prev = { ...data[i - 1] };
        // @ts-ignore
        delete prev.name;
        Object.entries(prev).forEach(([name, score]) => {
          // @ts-ignore
          players[name] = score;
        });
      }
      game.scores.forEach(({ playerId, stack, buyins }) => {
        players[playerNames[playerId]] += stack - buyins * 100;
      });
      // @ts-ignore
      data[i] = {
        name: game.date.toLocaleDateString("sv-SE", {
          month: "short",
          day: "2-digit",
        }),
        ...players,
      };
    });
  return data;
}

export function extractWinrate(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  // Initialize counters for wins and total games played for each player
  const wins = Object.fromEntries(
    Object.values(playerNames).map((name) => [name, 0])
  );
  const totalGames = Object.fromEntries(
    Object.values(playerNames).map((name) => [name, 0])
  );

  games.forEach((game) => {
    game.scores.forEach(({ playerId, stack, buyins }) => {
      const playerName = playerNames[playerId];
      // Increment total games played for this player
      totalGames[playerName] += 1;
      // Check if the player won (did not lose money)
      if (stack >= buyins * 100) {
        wins[playerName] += 1;
      }
    });
  });

  // Calculate win rates and format data for Recharts
  const data = Object.keys(playerNames).map((playerId) => {
    const playerName = playerNames[playerId];
    const winRate =
      totalGames[playerName] > 0
        ? (wins[playerName] / totalGames[playerName]) * 100
        : 0;
    return { name: playerName, WinRate: winRate };
  });

  return data;
}

export function getTopPlayers(games: ExtendedGame[], players: Player[]) {
  const data = extractTotals(games, players);
  const latest = data[data.length - 1];
  // @ts-ignore
  delete latest.name;
  // @ts-ignore
  return Object.entries(latest).sort((a, b) => b[1] - a[1]);
}

export function getPlayersWithMoreThanKGames(
  games: ExtendedGame[],
  players: Player[],
  k: number
): (Player & { games: number })[] {
  const gamesPerPlayer = games.reduce((acc, game) => {
    game.players.forEach((player) => {
      if (acc[player.name]) {
        acc[player.name]++;
      } else {
        acc[player.name] = 1;
      }
    });
    return acc;
  }, {} as { [name: string]: number });
  return players
    .filter(({ name }) => name in gamesPerPlayer && gamesPerPlayer[name] > k)
    .map((player) => ({ ...player, games: gamesPerPlayer[player.name] }));
}

export function getTop12WithMoreThanKGames(
  games: ExtendedGame[],
  players: Player[],
  k: number
) {
  const playersWithMoreThanKGames = getPlayersWithMoreThanKGames(
    games,
    players,
    k
  );
  return getTopPlayers(games, playersWithMoreThanKGames)
    .slice(0, 12)
    .map(([name, score]) => {
      const player = playersWithMoreThanKGames.find(
        (player) => player.name === name
      );
      return [name, score, player?.games];
    });
}

export function getTop12Players(games: ExtendedGame[], players: Player[]) {
  return getTopPlayers(games, players)
    .slice(0, 12)
    .map(([name]) => name);
}

export function extractAverageBuyinStackData(
  games: ExtendedGame[],
  players: Player[]
) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  // Initialize structures to hold total buyins, stacks, and game counts
  const totalBuyins = Object.fromEntries(
    Object.values(playerNames).map((name) => [name, 0])
  );
  const totalStacks = Object.fromEntries(
    Object.values(playerNames).map((name) => [name, 0])
  );
  const gameCounts = Object.fromEntries(
    Object.values(playerNames).map((name) => [name, 0])
  );

  games.forEach((game) => {
    game.scores.forEach(({ playerId, buyins, stack }) => {
      const playerName = playerNames[playerId];
      totalBuyins[playerName] += buyins;
      totalStacks[playerName] += stack;
      gameCounts[playerName] += 1;
    });
  });

  // Calculate average buyins and stacks for each player
  const data = Object.entries(playerNames).map(([id, name]) => {
    const avgBuyin = (totalBuyins[name] / gameCounts[name]) * 100; // Multiply by 100 if buyins are not already in currency units
    const avgStack = totalStacks[name] / gameCounts[name];
    return {
      name, // Player name for the x-axis
      avgBuyin,
      avgStack,
    };
  });

  return data.filter(({ avgBuyin }) => !isNaN(avgBuyin)); // Filter out players with no games
}

export function extractWinsLossesData(
  games: ExtendedGame[],
  players: Player[]
) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  // Initialize counters for wins and losses
  const wins = Object.fromEntries(
    Object.values(playerNames).map((name) => [name, 0])
  );
  const losses = Object.fromEntries(
    Object.values(playerNames).map((name) => [name, 0])
  );

  games.forEach((game) => {
    game.scores.forEach(({ playerId, buyins, stack }) => {
      const playerName = playerNames[playerId];
      if (stack >= buyins * 100) {
        // Count as a win
        wins[playerName] += 1;
      } else {
        // Count as a loss
        losses[playerName] += 1;
      }
    });
  });

  // Prepare data for the chart
  const data = Object.entries(playerNames).map(([id, name]) => ({
    name, // Player name for the x-axis
    wins: wins[name],
    losses: losses[name],
  }));

  return data;
}
