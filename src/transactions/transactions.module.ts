import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma.service';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionCategoriesService, PrismaService, TransactionsMapper],
})
export class TransactionsModule {}
