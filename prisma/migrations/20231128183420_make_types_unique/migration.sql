/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `transaction_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transaction_types_name_key" ON "transaction_types"("name");
