import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyLimitsNotifications } from '../utils/notifications/monthly-limits.notifications';
import { MonthlyLimitsController } from './monthly-limits.controller';
import { MonthlyLimitsService } from './monthly-limits.service';

@Module({
	controllers: [MonthlyLimitsController],
	providers: [MonthlyLimitsService, MonthlyLimitsNotifications, PrismaService],
	exports: [MonthlyLimitsNotifications, MonthlyLimitsService],
})
export class MonthlyLimitsModule {}
