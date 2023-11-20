import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExpenseDTO } from './dto/expenses.dto';
import { ExpenseMapper } from './mappers/expense.mapper';
import { getTimeRangeStartAndEnd } from '../utils/timerange/timeRange.func';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private mapper: ExpenseMapper,
  ) {}

  async createNewExpense(userFromRequest: any, expenseDto: CreateExpenseDTO) {
    const category = await this.prisma.expenseCategory.findUnique({ where: { name: expenseDto.category } });
    const user = await this.prisma.user.findUnique({ where: { id: userFromRequest.sub } });

    if (!category || !user) {
      throw new HttpException('Cannot add expense with such parameters', 400);
    }

    const createdExpense = await this.prisma.expense.create({
      data: {
        amount: expenseDto.amount,
        description: expenseDto.description,
        category: {
          connect: { name: category.name },
        },
        user: {
          connect: { id: user.id },
        },
        date: new Date(),
      },
    });

    console.log(`create expense ${createdExpense.expense_id}`);

    return createdExpense;
  }

  async getSingleExpense(id: number, user_id: number) {
    const candidate = await this.prisma.expense.findUnique({ where: { expense_id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const user = await this.prisma.user.findUnique({ where: { id: candidate.user_id } });
    const category = await this.prisma.expenseCategory.findUnique({ where: { id: candidate.category_id } });

    return this.mapper.mapExpenseToGetModel(candidate, user, category);
  }

  async deleteExpense(id: number, user_id: number) {
    const candidate = await this.prisma.expense.findUnique({ where: { expense_id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const deleted = await this.prisma.expense.delete({ where: { expense_id: id } });

    console.log(`Delete expense with id: ${deleted.expense_id}`);

    return deleted;
  }

  async changeExpenseCategory(category: string, expense_id: number, user_id: number) {
    const candidate = await this.prisma.expense.findUnique({ where: { expense_id: expense_id } });
    const candidateCategory = await this.prisma.expenseCategory.findUnique({ where: { name: category } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (!candidateCategory) {
      throw new HttpException('No categories found. Please create new category', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const changedExpense = await this.prisma.expense.update({
      where: { expense_id: expense_id },
      data: { category_id: candidateCategory.id },
    });

    console.log(`Expense category change for expense ${changedExpense.expense_id}`);

    return changedExpense;
  }

  getExpensesByTimeRange(user_id: number, timeRange: string) {
    const { startOfTime, endOfTime } = getTimeRangeStartAndEnd(timeRange);

    return this.findExpenseListByTimeRange(user_id, startOfTime, endOfTime);
  }

  async findExpenseListByTimeRange(user_id: number, startTime: Date, endTime: Date) {
    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    const candidates = await this.prisma.expense.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: startTime.toISOString(),
          lte: endTime.toISOString(),
        },
      },
    });

    const { formatted, total } = await this.mapper.mapExpenseListToModel(candidates, user);

    console.log(`${candidates.length} expenses found by time range ${startTime} : ${endTime}`);

    return {
      total,
      expenseList: formatted,
    };
  }
}
