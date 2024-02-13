import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigService } from './config/config.service';
import { MonthlyLimitsModule } from './monthly-limits/monthly-limits.module';
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
	imports: [AuthModule, TransactionsModule, TransactionCategoriesModule, MonthlyLimitsModule],
	providers: [ConfigService],
})
export class AppModule {}
