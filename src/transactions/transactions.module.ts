import { Module } from '@nestjs/common';
import { RedisService } from 'src/utils/cache/redis.service';
import { MonthlyLimitsModule } from '../monthly-limits/monthly-limits.module';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { TransactionRedisHelper } from './related/transaction-cache.helper';
import { TransactionFetcher } from './related/transaction.fetcher';
import { TransactionValidator } from './related/transaction.validator';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
	controllers: [TransactionsController],
	providers: [
		TransactionsService,
		TransactionCategoriesService,
		TransactionsMapper,
		PrismaService,
		RedisService,
		TransactionRedisHelper,
		TransactionFetcher,
		TransactionValidator,
	],
	imports: [MonthlyLimitsModule],
})
export class TransactionsModule {}
