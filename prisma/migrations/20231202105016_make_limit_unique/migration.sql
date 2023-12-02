/*
  Warnings:

  - You are about to drop the `montly_limits` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "montly_limits" DROP CONSTRAINT "montly_limits_user_id_fkey";

-- DropTable
DROP TABLE "montly_limits";

-- CreateTable
CREATE TABLE "monthly_limits" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "limit_amount" INTEGER NOT NULL,
    "total_expenses" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "monthly_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_limits_user_id_key" ON "monthly_limits"("user_id");

-- AddForeignKey
ALTER TABLE "monthly_limits" ADD CONSTRAINT "monthly_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
