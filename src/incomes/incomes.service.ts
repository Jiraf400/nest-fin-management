import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IncomesMapper } from './mappers/incomes.mapper';
import { CreateIncomeDto } from './dto/incomes.dto';
import { getTimeRangeStartAndEnd } from '../utils/timerange/timeRange.func';

@Injectable()
export class IncomesService {
  constructor(
    private prisma: PrismaService,
    private mapper: IncomesMapper,
  ) {}

  async addNewIncome(userFromRequest: any, incomeDto: CreateIncomeDto) {
    incomeDto.category = incomeDto.category.toUpperCase().trim();

    const category = await this.prisma.incomeCategory.findUnique({ where: { name: incomeDto.category } });

    const user = await this.prisma.user.findUnique({ where: { id: userFromRequest.sub } });

    console.log('----------');
    console.log(JSON.stringify(category));
    console.log(JSON.stringify(user));
    console.log('----------');

    if (!category || !user) {
      throw new HttpException('Cannot add income with such parameters', 400);
    }

    const createdIncome = await this.prisma.income.create({
      data: {
        amount: incomeDto.amount,
        category: {
          connect: { name: category.name },
        },
        user: {
          connect: { id: user.id },
        },
        date: new Date(),
      },
    });

    console.log(`create income ${createdIncome.id}`);

    return createdIncome;
  }

  async getSingleIncome(id: number, user_id: number) {
    const candidate = await this.prisma.income.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const user = await this.prisma.user.findUnique({ where: { id: candidate.user_id } });

    const category = await this.prisma.incomeCategory.findUnique({ where: { id: candidate.category_id } });

    return this.mapper.mapIncomeToGetModel(candidate, user, category);
  }

  async changeIncomeCategory(category: string, income_id: number, user_id: number) {
    const candidate = await this.prisma.income.findUnique({ where: { id: income_id } });
    const candidateCategory = await this.prisma.incomeCategory.findUnique({ where: { name: category } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (!candidateCategory) {
      throw new HttpException('No categories found. Please create new category', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const changedIncome = await this.prisma.income.update({
      where: { id: income_id },
      data: {
        category: {
          connect: { name: category },
        },
      },
    });

    console.log(`Income category change for income ${changedIncome.id}`);

    return changedIncome;
  }

  async deleteIncome(id: number, user_id: number) {
    const candidate = await this.prisma.income.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const deleted = await this.prisma.income.delete({ where: { id: id } });

    console.log(`Delete income with id: ${deleted.id}`);

    return deleted;
  }

  getIncomesByTimeRange(user_id: number, timeRange: string) {
    const { startOfTime, endOfTime } = getTimeRangeStartAndEnd(timeRange);

    return this.findIncomeListByTimeRange(user_id, startOfTime, endOfTime);
  }

  async findIncomeListByTimeRange(user_id: number, startTime: Date, endTime: Date) {
    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    const candidates = await this.prisma.income.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: startTime.toISOString(),
          lte: endTime.toISOString(),
        },
      },
    });

    const { formatted, total } = await this.mapper.mapIncomeListToModel(candidates, user);

    console.log(`${candidates.length} incomes found by time range ${startTime} : ${endTime}`);

    return {
      total,
      list: formatted,
    };
  }
}
