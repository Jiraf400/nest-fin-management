import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CategoriesModule } from './expense-categories/categories.module';
import { IncomesModule } from './incomes/incomes.module';
import { IncomesCategoriesModule } from './incomes-categories/incomes-categories.module';

@Module({
  imports: [AuthModule, UsersModule, ExpensesModule, CategoriesModule, IncomesModule, IncomesCategoriesModule],
})
export class AppModule {}
