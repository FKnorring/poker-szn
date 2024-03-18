"use server";
import { updateScore } from "@/app/utils";

export async function updatePlayerScore({
  playerId,
  buyins,
  stack,
  gameId,
}: {
  playerId: number;
  buyins: number;
  stack: number;
  gameId: number;
}) {
  return await updateScore({ playerId, buyins, stack, gameId });
}
