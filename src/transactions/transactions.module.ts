import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { MonthlyLimitsModule } from '../monthly-limits/monthly-limits.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionCategoriesService, TransactionsMapper, PrismaService],
  imports: [MonthlyLimitsModule],
})
export class TransactionsModule {}
