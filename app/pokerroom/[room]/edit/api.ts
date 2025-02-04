"use server";
import {
  addPlayerToGame,
  addNewPlayerToGame,
  addGame,
  updateScores,
  removePlayerFromGame,
  removeGame,
} from "@/app/utils";

export async function handleAddPlayerToGame(playerId: string, gameId: string) {
  return await addPlayerToGame(playerId, gameId);
}

export async function handleAddNewPlayerToGame(name: string, gameId: string, roomId: string) {
  return await addNewPlayerToGame(name, gameId, roomId);
}

export async function handleAddGame(date: string, roomId: string, seasonId: string) {
  return await addGame(new Date(date), roomId, seasonId);
}

type ScoreData = {
  playerId: string;
  buyins: number;
  stack: number;
};

export async function handleUpdateGameScores(
  scores: ScoreData[],
  gameId: string
) {
  await updateScores(scores, gameId);
}

export async function handleRemovePlayerFromGame(
  playerId: string,
  gameId: string
) {
  return await removePlayerFromGame(playerId, gameId);
}

export async function handleRemoveGame(id: string) {
  return await removeGame(id);
}

export async function updateSeasonName(
  seasonId: string, 
  data: { name: string; startDate?: Date; endDate?: Date }
) {
  const response = await fetch(`/api/seasons/${seasonId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update season");
  }

  return response.json();
}

export async function updateRoom(
  roomId: string,
  data: { name: string; currency: string; defaultBuyIn: number }
) {
  const response = await fetch(`/api/rooms/${roomId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update room");
  }

  return response.json();
}

export async function createSeason(roomId: string, data: { name: string; startDate: Date; endDate?: Date }) {
  const response = await fetch(`/api/rooms/${roomId}/seasons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create season");
  }

  return response.json();
}

export async function createPlayer(roomId: string, name: string) {
  const response = await fetch(`/api/rooms/${roomId}/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create player");
  }

  return response.json();
}

export async function removePlayer(roomId: string, playerId: string) {
  const response = await fetch(`/api/rooms/${roomId}/players/${playerId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove player");
  }

  return response.json();
}
