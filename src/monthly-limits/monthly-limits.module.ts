import { Module } from '@nestjs/common';
import { MonthlyLimitsController } from './monthly-limits.controller';
import { MonthlyLimitsService } from './monthly-limits.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MonthlyLimitsController],
  providers: [MonthlyLimitsService, PrismaService],
})
export class MonthlyLimitsModule {}
