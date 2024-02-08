/*
  Warnings:

  - You are about to drop the column `score` on the `Score` table. All the data in the column will be lost.
  - Added the required column `buyins` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stack` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Score" DROP COLUMN "score",
ADD COLUMN     "buyins" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stack" DOUBLE PRECISION NOT NULL;
