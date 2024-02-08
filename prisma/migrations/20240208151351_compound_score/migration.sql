/*
  Warnings:

  - A unique constraint covering the columns `[gameId,playerId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Score_gameId_playerId_key" ON "Score"("gameId", "playerId");
