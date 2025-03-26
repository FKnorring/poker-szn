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

export async function getRoomData(roomId: string, password?: string) {
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
  const hasPasswordAccess = !room.password ||
    canEdit ||
    (password === room.password);

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

  const nameToObfuscated: { [key: string]: string } = {};
  let obfuscatedPlayers = players;
  
  // Simple but deterministic hash function for strings
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Seeded random number generator
  function seededRandom(seed: number): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // Fun poker-related terms for obfuscation
  const firstTerms = [
    "Lucky", "Wild", "Royal", "River", "Pocket", 
    "Diamond", "Heart", "Spade", "Club", "Ace",
    "King", "Queen", "Jack", "Joker", "Flush",
    "Straight", "Full", "High", "Big", "Small",
    "Quick", "Sharp", "Smooth", "Silent", "Bold"
  ];
  
  const secondTerms = [
    "Dealer", "Shark", "Bluffer", "Runner", "Roller",
    "Stack", "Chips", "Cards", "House", "Pot",
    "Draw", "Fold", "Call", "Raise", "Check",
    "Ante", "River", "Flop", "Turn", "Split",
    "Gambit", "Play", "Hand", "Bet", "Action"
  ];

  // If no password access, obfuscate player names
  if (!hasPasswordAccess) {
    // Create consistent mapping first
    players.forEach((player) => {
      const hash = hashString(player.name);
      const rand1 = seededRandom(hash);
      const rand2 = seededRandom(hash + 1);
      
      const firstIndex = Math.floor(rand1 * firstTerms.length);
      const secondIndex = Math.floor(rand2 * secondTerms.length);
      
      nameToObfuscated[player.name] = `${firstTerms[firstIndex]} ${secondTerms[secondIndex]}`;
    });
    
    // Apply mapping to main players list
    obfuscatedPlayers = players.map(player => ({
      ...player,
      name: nameToObfuscated[player.name]
    }));

    // Apply mapping to games data consistently
    const obfuscatedGames = games.map(game => ({
      ...game,
      scores: game.scores.map(score => ({
        ...score,
        player: {
          ...score.player,
          name: nameToObfuscated[score.player.name]
        }
      })),
      players: game.players.map(player => ({
        ...player,
        name: nameToObfuscated[player.name]
      }))
    }));

    // Return obfuscated data
    return {
      room,
      games: obfuscatedGames,
      players: obfuscatedPlayers,
      totalBuyin,
      hasPasswordAccess
    };
  }

  // Return non-obfuscated data
  return {
    room,
    games,
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
