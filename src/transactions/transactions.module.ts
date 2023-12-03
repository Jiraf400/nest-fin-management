import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma.service';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { MonthlyLimitsService } from '../monthly-limits/monthly-limits.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionCategoriesService,
    TransactionsMapper,
    MonthlyLimitsService,
    PrismaService,
  ],
})
export class TransactionsModule {}
