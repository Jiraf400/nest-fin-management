/*
  Warnings:

  - You are about to drop the column `transactionTypeId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_transactionTypeId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "transactionTypeId";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "transaction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
