import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IncomeCategoriesController } from './income-categories.controller';
import { IncomeCategoriesService } from './income-categories.service';

@Module({
  controllers: [IncomeCategoriesController],
  providers: [IncomeCategoriesService, PrismaService],
})
export class IncomesCategoriesModule {}
