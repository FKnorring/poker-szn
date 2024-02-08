"use server";
import {
  addPlayerToGame,
  addNewPlayerToGame,
  addGame,
  updateScores,
} from "@/app/utils";

export async function handleAddPlayerToGame(playerId: number, gameId: number) {
  return await addPlayerToGame(playerId, gameId);
}

export async function handleAddNewPlayerToGame(name: string, gameId: number) {
  return await addNewPlayerToGame(name, gameId);
}

export async function handleAddGame(date: string) {
  return await addGame(new Date(date));
}

type ScoreData = {
  playerId: number;
  buyins: number;
  stack: number;
};

export async function handleUpdateGameScores(
  scores: ScoreData[],
  gameId: number
) {
  await updateScores(scores, gameId);
}
