"use server";
import { addPlayerToGame } from "@/app/utils";

export async function handleAddPlayerToGame(gameId: number, playerId: number) {
  await addPlayerToGame(playerId, gameId);
}
