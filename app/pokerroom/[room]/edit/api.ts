"use server";
import {
  addPlayerToGame,
  addNewPlayerToGame,
  addGame,
  updateScores,
  removePlayerFromGame,
  removeGame,
} from "@/app/utils";

export async function handleAddPlayerToGame(playerId: number, gameId: string) {
  return await addPlayerToGame(playerId, gameId);
}

export async function handleAddNewPlayerToGame(name: string, gameId: string) {
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

export async function handleRemovePlayerFromGame(
  playerId: number,
  gameId: number
) {
  return await removePlayerFromGame(playerId, gameId);
}

export async function handleRemoveGame(id: number) {
  return await removeGame(id);
}
