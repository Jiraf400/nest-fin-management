import { Module } from '@nestjs/common';
import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';
import { IncomesMapper } from './mappers/incomes.mapper';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [IncomesController],
  providers: [IncomesService, IncomesMapper, PrismaService],
})
export class IncomesModule {}
