import { ExtendedGame } from "@/app/pokerroom/[room]/edit/games";
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

export function getContrastColor(bgColor: string) {
  // Remove the hash if it's there
  bgColor = bgColor.replace("#", "");

  // Parse the R, G, B values
  const r = parseInt(bgColor.substr(0, 2), 16);
  const g = parseInt(bgColor.substr(2, 2), 16);
  const b = parseInt(bgColor.substr(4, 2), 16);

  // Calculate the brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return 'black' or 'white' based on brightness
  return brightness > 128 ? "black" : "white";
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
  const gamesPerPlayer = games.reduce((acc, game) => {
    game.scores.forEach((score) => {
      if (acc[score.player.name]) {
        acc[score.player.name]++;
      } else {
        acc[score.player.name] = 1;
      }
    });
    return acc;
  }, {} as { [name: string]: number });
  const latest = data[data.length - 1];
  // @ts-ignore
  if (latest && latest.name) delete latest.name;
  else return [];

  return Object.entries(latest) // @ts-ignore
    .sort((a, b) => b[1] - a[1])
    .map(([name, score]) => {
      return [name, score, gamesPerPlayer[name]];
    });
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

export function getTop10PlayersByAttendance(
  games: ExtendedGame[],
  players: Player[]
) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  const attendance = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as PlayerData);

  games.forEach((game) => {
    game.scores.forEach(({ playerId }) => {
      const playerName = playerNames[playerId];
      if (playerName) {
        attendance[playerName] += 1;
      }
    });
  });

  return Object.entries(attendance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([name, _]) => name)
    .filter((name) => name);
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

export function calculateTotalBuyin(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  const totalBuyins = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as PlayerData);

  games.forEach((game) => {
    game.scores.forEach(({ playerId, buyins }) => {
      const playerName = playerNames[playerId];
      totalBuyins[playerName] += buyins * 100; // Assuming buyins are counted in units of 100
    });
  });

  return Object.entries(totalBuyins).map(([name, buyin]) => ({
    name,
    buyin,
  }));
}

export function calculateMaxStack(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  const maxStacks = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = { stack: 0, buyin: 0 };
    return acc;
  }, {} as { [name: string]: { stack: number; buyin: number } });

  games.forEach((game) => {
    game.scores.forEach(({ playerId, stack, buyins }) => {
      const playerName = playerNames[playerId];
      if (!playerName) return;
      if (stack > maxStacks[playerName].stack) {
        maxStacks[playerName].stack = stack;
        maxStacks[playerName].buyin = buyins * 100; // Assuming buyins are counted in units of 100
      }
    });
  });

  return Object.entries(maxStacks).map(([name, { stack, buyin }]) => ({
    name,
    stack,
    buyin,
  }));
}

export function calculateMaxGain(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  const maxGains = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = { stack: 0, buyin: 0, gain: 0 };
    return acc;
  }, {} as { [name: string]: { stack: number; buyin: number; gain: number } });

  games.forEach((game) => {
    game.scores.forEach(({ playerId, stack, buyins }) => {
      const playerName = playerNames[playerId];
      if (!playerName) return;
      const gain = stack - buyins * 100; // Calculate the gain
      if (gain > maxGains[playerName].gain) {
        maxGains[playerName] = { stack, buyin: -buyins * 100, gain };
      }
    });
  });

  return Object.entries(maxGains).map(([name, { stack, buyin, gain }]) => ({
    name,
    stack,
    buyin,
    gain,
  }));
}

export function extractHourlyRate(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  const totalGains = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as PlayerData);

  const totalGamesPlayed = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as PlayerData);

  games.forEach((game) => {
    game.scores.forEach(({ playerId, stack, buyins }) => {
      const playerName = playerNames[playerId];
      totalGains[playerName] += stack - buyins * 100;
      totalGamesPlayed[playerName] += 1;
    });
  });

  const hourlyRateData = Object.entries(playerNames).map(([id, name]) => {
    const totalHoursPlayed = totalGamesPlayed[name] * 5; // 5 hours per game
    const hourlyRate =
      totalHoursPlayed > 0 ? totalGains[name] / totalHoursPlayed : 0;
    return {
      name,
      hourlyRate,
    };
  });

  return hourlyRateData.filter(({ hourlyRate }) => !isNaN(hourlyRate)); // Filter out players with no games
}

export function extractROI(games: ExtendedGame[], players: Player[]) {
  const playerNames: PlayerNames = players.reduce((acc, player) => {
    acc[player.id] = player.name;
    return acc;
  }, {} as PlayerNames);

  const totalGains = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as PlayerData);

  const totalBuyins = Object.values(playerNames).reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as PlayerData);

  games.forEach((game) => {
    game.scores.forEach(({ playerId, stack, buyins }) => {
      const playerName = playerNames[playerId];
      totalGains[playerName] += stack - buyins * 100;
      totalBuyins[playerName] += buyins * 100; // Assuming buyins are counted in units of 100
    });
  });

  const ROIData = Object.entries(playerNames).map(([id, name]) => {
    const ROI =
      totalBuyins[name] > 0 ? (totalGains[name] / totalBuyins[name]) * 100 : 0;
    return {
      name,
      ROI,
    };
  });

  return ROIData.filter(({ ROI }) => !isNaN(ROI)); // Filter out players with no games
}
