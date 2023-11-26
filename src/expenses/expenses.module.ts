import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma.service';
import { ExpenseMapper } from './mappers/expense.mapper';
import { ExpenseCategoriesService } from '../expense-categories/expense-categories.service';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService, PrismaService, ExpenseMapper, ExpenseCategoriesService],
})
export class ExpensesModule {}
