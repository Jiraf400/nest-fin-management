-- DropForeignKey
ALTER TABLE "monthly_limits" DROP CONSTRAINT "monthly_limits_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_categories" DROP CONSTRAINT "transaction_categories_user_id_fkey";

-- AddForeignKey
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_limits" ADD CONSTRAINT "monthly_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
