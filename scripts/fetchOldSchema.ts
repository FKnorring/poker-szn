import { PrismaClient } from "@prisma/client";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// Ensure the data directory exists
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

async function exportTableToCSV(
  tableName: string,
  data: any[],
  headers: { id: string; title: string }[]
) {
  const csvWriter = createObjectCsvWriter({
    path: path.join(dataDir, `${tableName}.csv`),
    header: headers,
  });

  await csvWriter.writeRecords(data);
  console.log(`✅ Exported ${data.length} records from ${tableName}`);
}

async function fetchAndSaveData() {
  try {
    // Fetch and save Players
    const players = await prisma.player.findMany();
    await exportTableToCSV("players", players, [
      { id: "id", title: "ID" },
      { id: "name", title: "Name" },
    ]);

    // Fetch and save Games
    const games = await prisma.game.findMany();
    await exportTableToCSV("games", games, [
      { id: "id", title: "ID" },
      { id: "date", title: "Date" },
      { id: "season", title: "Season" },
    ]);

    // Fetch and save Scores with related player names
    const scores = await prisma.score.findMany({
      include: {
        player: true,
        game: true,
      },
    });

    const formattedScores = scores.map((score) => ({
      id: score.id,
      gameId: score.gameId,
      playerId: score.playerId,
      playerName: score.player.name,
      gameDate: score.game.date,
      buyins: score.buyins,
      stack: score.stack,
    }));

    await exportTableToCSV("scores", formattedScores, [
      { id: "id", title: "ID" },
      { id: "gameId", title: "Game ID" },
      { id: "playerId", title: "Player ID" },
      { id: "playerName", title: "Player Name" },
      { id: "gameDate", title: "Game Date" },
      { id: "buyins", title: "Buyins" },
      { id: "stack", title: "Stack" },
    ]);

    console.log("✨ All data has been exported successfully!");
  } catch (error) {
    console.error("Error exporting data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
fetchAndSaveData();
