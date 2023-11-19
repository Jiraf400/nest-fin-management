import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { IncomesModule } from './incomes/incomes.module';
import { IncomesCategoriesModule } from './income-categories/incomes-categories.module';

@Module({
  imports: [AuthModule, UsersModule, ExpensesModule, ExpenseCategoriesModule, IncomesModule, IncomesCategoriesModule],
})
export class AppModule {}
