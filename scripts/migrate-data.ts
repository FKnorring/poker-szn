import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface OldGame {
  ID: string;
  Date: string;
  Season: string;
}

interface OldPlayer {
  ID: string;
  Name: string;
}

interface OldScore {
  ID: string;
  "Game ID": string;
  "Player ID": string;
  "Player Name": string;
  "Game Date": string;
  Buyins: number;
  Stack: number;
}

async function readCsvFile<T>(filePath: string): Promise<T[]> {
  const fileContent = fs.readFileSync(filePath);
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
}

async function createSeasons(roomId: string) {
  // Create Season 1 (2023)
  const season1 = await prisma.season.upsert({
    where: { name_roomId: { name: "VT_24", roomId } },
    create: {
      name: "VT_24",
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-12-31"),
      roomId,
    },
    update: {
      name: "VT_24",
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-12-31"),
      roomId,
    },
  });

  // Create Season 2 (2024)
  const season2 = await prisma.season.upsert({
    where: { name_roomId: { name: "HT_24", roomId } },
    create: {
      name: "HT_24",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      roomId,
    },
    update: {
      name: "HT_24",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      roomId,
    },
  });

  return { season1, season2 };
}

async function migrateData() {
  try {
    const scores = await readCsvFile<OldScore>(
      path.join(process.cwd(), "data", "scores.csv")
    );
    /*
    const roomId = "cm6pm9ngx0005kt08yym2gsgw"; // Replace with your actual room ID

    // Create seasons
    const { season1, season2 } = await createSeasons(roomId);

    const season3Id = "cm6pm9nke0007kt08hfh4klv1";

    // Read CSV files
    const games = await readCsvFile<OldGame>(
      path.join(process.cwd(), "data", "games.csv")
    );
    const players = await readCsvFile<OldPlayer>(
      path.join(process.cwd(), "data", "players.csv")
    );
    

    for (const player of players) {
      await prisma.player.upsert({
        where: { id: player.ID },
        create: {
          id: player.ID,
          name: player.Name,
          roomId,
        },
        update: {
          name: player.Name,
          roomId,
        },
      });
    }

    // Process each game
    for (const game of games) {
      const gameDate = new Date(game.Date);
      const seasonId =
        game.Season === "0"
          ? season1.id
          : game.Season === "1"
          ? season2.id
          : season3Id;

      // Create game with new season reference
      await prisma.game.upsert({
        where: { id: game.ID },
        create: {
          id: game.ID,
          date: gameDate,
          seasonId,
          roomId,
          buyIn: 100,
        },
        update: {
          date: gameDate,
          seasonId,
          roomId,
          buyIn: 100,
        },
      });
    }

    for (const score of scores) {
      await prisma.score.create({
        data: {
          id: score.ID,
          gameId: score["Game ID"],
          playerId: score["Player ID"],
          buyins: Number(score.Buyins),
          stack: Number(score.Stack),
        },
      });
    }
      */

    for (const score of scores) {
      await prisma.game.update({
        where: { id: score["Game ID"] },
        data: {
          players: {
            connect: {
              id: score["Player ID"],
            },
          },
        },
      });
    }

    console.log("Data migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

// Run the migration
migrateData()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
