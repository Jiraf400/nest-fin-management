import { Module } from '@nestjs/common';
import { MonthlyLimitsController } from './monthly-limits.controller';
import { MonthlyLimitsService } from './monthly-limits.service';
import { PrismaService } from '../prisma.service';
import { MonthlyLimitsNotifications } from './monthly-limits.notifications';

@Module({
  controllers: [MonthlyLimitsController],
  providers: [MonthlyLimitsService, MonthlyLimitsNotifications, PrismaService],
  exports: [MonthlyLimitsNotifications, MonthlyLimitsService],
})
export class MonthlyLimitsModule {}
