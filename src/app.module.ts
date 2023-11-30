import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module';
import { MonthlyLimitsModule } from './monthly-limits/monthly-limits.module';

@Module({
  imports: [AuthModule, UsersModule, TransactionsModule, TransactionCategoriesModule, MonthlyLimitsModule],
})
export class AppModule {}
