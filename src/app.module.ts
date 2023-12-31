import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module';
import { MonthlyLimitsModule } from './monthly-limits/monthly-limits.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [AuthModule, TransactionsModule, TransactionCategoriesModule, MonthlyLimitsModule],
  providers: [
    {
      provide: ConfigService,
      useClass: ConfigService,
    },
  ],
})
export class AppModule {}
