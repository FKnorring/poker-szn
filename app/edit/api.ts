"use server";
import {
  addPlayerToGame,
  addNewPlayerToGame,
  addGame,
  updateScores,
} from "@/app/utils";

export async function handleAddPlayerToGame(playerId: number, gameId: number) {
  await addPlayerToGame(playerId, gameId);
}

export async function handleAddNewPlayerToGame(name: string, gameId: number) {
  await addNewPlayerToGame(name, gameId);
}

export async function handleAddGame(date: string) {
  await addGame(new Date(date));
}

type ScoreData = {
  playerId: number;
  score: number;
};

export async function handleUpdateGameScores(
  scores: ScoreData[],
  gameId: number
) {
  await updateScores(scores, gameId);
}
