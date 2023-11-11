/*
  Warnings:

  - The primary key for the `expenses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoryId` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `expenses` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `category_id` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_userId_fkey";

-- AlterTable
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_pkey",
DROP COLUMN "categoryId",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expense_id" SERIAL NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("expense_id");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
