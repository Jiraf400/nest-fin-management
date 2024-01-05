import { HttpException, Injectable } from '@nestjs/common';
import { MonthlyLimitDTO } from './dto/mlimit.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { MonthlyLimitsNotifications } from './monthly-limits.notifications';

@Injectable()
export class MonthlyLimitsService {
  constructor(
    private prisma: PrismaService,
    private notifications: MonthlyLimitsNotifications,
  ) {}

  async addNewMonthLimit(dto: MonthlyLimitDTO, user_id: number) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { user_id: user_id } });

    if (candidate) {
      throw new HttpException('Monthly limit has already been set. Able only to delete or update amount', 400);
    }

    const setLimit = await this.prisma.monthlyLimit.create({
      data: {
        user: {
          connect: { id: user_id },
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

  async changeLimitAmount(limit_amount: number, user_id: number, limit_id: number) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { id: limit_id } });

    if (!candidate) {
      throw new HttpException('Monthly limit object not found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const changeLimit = await this.prisma.monthlyLimit.update({
      where: { id: limit_id },
      data: { limit_amount: limit_amount },
    });

    console.log(`change limit by adding limit amount ${limit_amount}`);

    return changeLimit;
  }

  async deleteExpenseLimit(limit_id: number, user_id: number) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { id: limit_id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const deleteLimit = await this.prisma.monthlyLimit.delete({ where: { user_id: user_id } });

    console.log(`Delete monthly limit with id: ${deleteLimit.id}`);

    return deleteLimit;
  }

  async addExpenseToLimitTotal(expense_amount: number, user_id: number) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { user_id: user_id } });

    if (!candidate) {
      return;
    }

    const changeLimit = await this.prisma.monthlyLimit.update({
      where: { user_id: user_id },
      data: { total_expenses: candidate.total_expenses + expense_amount },
    });

    console.log(`change limit by adding expense amount ${expense_amount}`);

    return changeLimit;
  }

  async removeExpenseFromLimitTotal(expense_amount: number, user_id: number) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { user_id: user_id } });

    if (!candidate) {
      return;
    }

    const changeLimit = await this.prisma.monthlyLimit.update({
      where: { user_id: user_id },
      data: { total_expenses: candidate.total_expenses - expense_amount },
    });

    console.log(`change limit by adding expense amount ${expense_amount}`);

    return changeLimit;
  }

  async ifLimitReachedSendAnEmail(user: User) {
    const candidate = await this.prisma.monthlyLimit.findUnique({ where: { user_id: user.id } });

    if (!candidate) {
      return;
    }

    if (candidate.total_expenses > candidate.limit_amount) {
      this.notifications.sendLimitReachedEmail(user.name, user.email);
    } else {
      return;
    }
  }
}
