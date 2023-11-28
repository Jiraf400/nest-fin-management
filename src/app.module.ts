import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module';

@Module({
  imports: [AuthModule, UsersModule, TransactionsModule, TransactionCategoriesModule],
})
export class AppModule {}
