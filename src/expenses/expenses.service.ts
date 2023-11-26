import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExpenseDTO } from './dto/expenses.dto';
import { ExpenseMapper } from './mappers/expense.mapper';
import { getTimeRangeStartAndEnd } from '../utils/timerange/timeRange.func';
import { ExpenseCategoriesService } from '../expense-categories/expense-categories.service';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private mapper: ExpenseMapper,
    private categoriesService: ExpenseCategoriesService,
  ) {}

  async createNewExpense(userFromRequest: any, expenseDto: CreateExpenseDTO) {
    const categoryCandidateId = await this.categoriesService.ifCategoryExistsReturnsItsId(
      expenseDto.category,
      userFromRequest.sub,
    );

    const user = await this.prisma.user.findUnique({ where: { id: userFromRequest.sub } });

    if (!user || categoryCandidateId === 0) {
      throw new HttpException('Cannot add expense with such parameters', 400);
    }

    const createdExpense = await this.prisma.expense.create({
      data: {
        amount: expenseDto.amount,
        description: expenseDto.description,
        category: {
          connect: { id: categoryCandidateId },
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
    const expense = await this.prisma.expense.findUnique({ where: { expense_id: expense_id } });

    const categoryCandidateId = await this.categoriesService.ifCategoryExistsReturnsItsId(category, user_id);

    if (!expense) {
      throw new HttpException('No objects found', 400);
    }

    if (categoryCandidateId === 0) {
      throw new HttpException('No categories found. Please create new category', 400);
    }

    if (expense.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const changedExpense = await this.prisma.expense.update({
      where: { expense_id: expense_id },
      data: { category_id: categoryCandidateId },
    });

    console.log(`Expense category change for expense ${changedExpense.expense_id}`);

    return changedExpense;
  }

  async getExpensesByTimeRange(user_id: number, timeRange: string) {
    const { startOfTime, endOfTime } = getTimeRangeStartAndEnd(timeRange);

    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    const candidates = await this.prisma.expense.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: startOfTime.toISOString(),
          lte: endOfTime.toISOString(),
        },
      },
    });

    const { formatted, total } = await this.mapper.mapExpenseListToModel(candidates, user);

    console.log(`${candidates.length} expenses found by time range ${startOfTime} : ${endOfTime}`);

    return {
      total,
      expenseList: formatted,
    };
  }
}
