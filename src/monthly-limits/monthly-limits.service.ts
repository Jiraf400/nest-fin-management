import { HttpException, Injectable } from '@nestjs/common';
import { MonthlyLimitDTO } from './dto/mlimit.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MonthlyLimitsService {
  constructor(private prisma: PrismaService) {}

  async addNewMonthLimit(dto: MonthlyLimitDTO, user: any) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { user_id: user.sub } });

    if (candidate) {
      throw new HttpException('Monthly limit has already been set. Able only to delete or update amount', 400);
    }

    const setLimit = await this.prisma.monthlyLimit.create({
      data: {
        user: {
          connect: { id: user.sub },
        },
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        limit_amount: dto.limit_amount,
        total_expenses: 0,
      },
    });

    console.log(`set new limit ${setLimit.id}`);

    return setLimit;
  }

  async addExpenseToLimit(expense_amount: number, user_id: number) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { user_id: user_id } });

    if (!candidate) {
      throw new HttpException('Monthly limit object not found', 400);
    }

    const changeLimit = await this.prisma.monthlyLimit.update({
      where: { user_id: user_id },
      data: { total_expenses: candidate.total_expenses + expense_amount },
    });

    console.log(`change limit by adding expense amount ${expense_amount}`);

    return changeLimit;
  }

  async deleteExpenseLimit(user: any) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { user_id: user.sub } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    const deleteLimit = await this.prisma.monthlyLimit.delete({ where: { user_id: user.sub } });

    console.log(`Delete monthly limit with id: ${deleteLimit.id}`);

    return deleteLimit;
  }

  //TODO method to change limit amount
  //TODO method to check if limit reached
}
