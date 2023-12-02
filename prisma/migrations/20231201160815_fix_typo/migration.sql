/*
  Warnings:

  - You are about to drop the column `limit_amound` on the `montly_limits` table. All the data in the column will be lost.
  - Added the required column `limit_amount` to the `montly_limits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "montly_limits" DROP COLUMN "limit_amound",
ADD COLUMN     "limit_amount" INTEGER NOT NULL;
