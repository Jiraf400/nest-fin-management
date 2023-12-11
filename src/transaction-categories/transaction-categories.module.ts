import { Module } from '@nestjs/common';
import { TransactionCategoriesController } from './transaction-categories.controller';
import { TransactionCategoriesService } from './transaction-categories.service';
import { PrismaService } from '../utils/prisma/prisma.service';

@Module({
  controllers: [TransactionCategoriesController],
  providers: [TransactionCategoriesService, PrismaService],
})
export class TransactionCategoriesModule {}
