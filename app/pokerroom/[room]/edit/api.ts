import {
  addPlayerToGame as addPlayerToGameServer,
  addNewPlayerToGame as addNewPlayerToGameServer,
  addGame,
  updateScores,
  removePlayerFromGame as removePlayerFromGameServer,
  removeGame as removeGameServer,
} from "@/app/utils";

export async function addPlayerToGame(
  roomId: string,
  gameId: string,
  data: { playerId?: string; name?: string }
) {
  const response = await fetch(
    `/api/pokerroom/${roomId}/games/${gameId}/players`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add player to game");
  }

  return response.json();
}

// @deprecated Use addPlayerToGame instead
export async function handleAddPlayerToGame(playerId: string, gameId: string) {
  return await addPlayerToGameServer(playerId, gameId);
}

// @deprecated Use addPlayerToGame instead
export async function handleAddNewPlayerToGame(
  name: string,
  gameId: string,
  roomId: string
) {
  return await addNewPlayerToGameServer(name, gameId, roomId);
}

export async function createGame(
  roomId: string,
  data: {
    date: string;
    seasonId: string;
    buyIn?: number;
  }
) {
  const response = await fetch(`/api/pokerroom/${roomId}/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create game");
  }

  return response.json();
}

// @deprecated Use createGame instead
export async function handleAddGame(
  date: string,
  roomId: string,
  seasonId: string
) {
  return await addGame(new Date(date), roomId, seasonId);
}

type ScoreData = {
  playerId: string;
  buyins: number;
  stack: number;
};

export async function updateGameScores(
  roomId: string,
  gameId: string,
  scores: { playerId: string; buyins: number; stack: number }[]
) {
  const response = await fetch(
    `/api/pokerroom/${roomId}/games/${gameId}/scores`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scores }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update game scores");
  }

  return response.json();
}

// @deprecated Use updateGameScores instead
export async function handleUpdateGameScores(
  scores: ScoreData[],
  gameId: string
) {
  await updateScores(scores, gameId);
}

export async function removePlayerFromGame(
  roomId: string,
  gameId: string,
  playerId: string
) {
  const response = await fetch(
    `/api/pokerroom/${roomId}/games/${gameId}/players/${playerId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove player from game");
  }

  return response.json();
}

// @deprecated Use removePlayerFromGame instead
export async function handleRemovePlayerFromGame(
  playerId: string,
  gameId: string
) {
  return await removePlayerFromGameServer(playerId, gameId);
}

export async function removeGame(roomId: string, gameId: string) {
  const response = await fetch(`/api/pokerroom/${roomId}/games/${gameId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove game");
  }
}

// @deprecated Use removeGame instead
export async function handleRemoveGame(gameId: string) {
  return await removeGameServer(gameId);
}

export async function updateSeasonName(
  seasonId: string,
  data: { name: string; startDate?: string; endDate?: string }
) {
  try {
    const response = await fetch(`/api/seasons/${seasonId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update season");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating season:", error);
    throw error;
  }
}

export async function updateRoom(
  roomId: string,
  data: { name: string; currency: string; defaultBuyIn: number }
) {
  const response = await fetch(`/api/pokerroom/${roomId}`, {
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

export async function createSeason(
  roomId: string,
  data: { name: string; startDate: Date; endDate?: Date }
) {
  const response = await fetch(`/api/pokerroom/${roomId}/seasons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate?.toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create season");
  }

  return response.json();
}

export async function createPlayer(roomId: string, name: string) {
  const response = await fetch(`/api/pokerroom/${roomId}/players`, {
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
  const response = await fetch(`/api/pokerroom/${roomId}/players/${playerId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove player");
  }

  return response.json();
}

export async function addManager(roomId: string, email: string) {
  const response = await fetch(`/api/pokerroom/${roomId}/managers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Failed to add manager");
  }

  return response.json();
}

export async function removeManager(roomId: string, managerId: string) {
  const response = await fetch(
    `/api/pokerroom/${roomId}/managers/${managerId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove manager");
  }

  return response.json();
}

export async function getManagers(roomId: string) {
  const response = await fetch(`/api/pokerroom/${roomId}/managers`);

  if (!response.ok) {
    throw new Error("Failed to fetch managers");
  }

  return response.json();
}

export async function updateGameSettings(
  roomId: string,
  gameId: string,
  data: { seasonId?: string; buyIn?: number }
) {
  const response = await fetch(`/api/pokerroom/${roomId}/games/${gameId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update game settings");
  }

  return response.json();
}
