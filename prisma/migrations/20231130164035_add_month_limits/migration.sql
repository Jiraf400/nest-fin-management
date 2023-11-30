-- CreateTable
CREATE TABLE "montly_limits" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "limit_amound" INTEGER NOT NULL,
    "total_expenses" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "montly_limits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "montly_limits" ADD CONSTRAINT "montly_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
