import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsDto } from './dto/transactions.dto';
import { getTimeRangeStartAndEnd } from '../utils/timerange/timeRange.func';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { MonthlyLimitsService } from '../monthly-limits/monthly-limits.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private mapper: TransactionsMapper,
    private categoriesService: TransactionCategoriesService,
    private mLimitService: MonthlyLimitsService,
  ) {}

  async addNewTransaction(user_id: number, trDto: TransactionsDto) {
    const categoryCandidateId = await this.categoriesService.ifCategoryExistsReturnsItsId(trDto.category, user_id);

    const trType = this.validateTranscationTypeOrThrow(trDto.type);

    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    if (!user || categoryCandidateId === 0) {
      throw new HttpException('Cannot add transaction with such parameters', 400);
    }

    const addedTransaction = await this.prisma.transaction.create({
      data: {
        amount: trDto.amount,
        description: trDto.description,
        category: {
          connect: { id: categoryCandidateId },
        },
        type: {
          connect: { name: trType },
        },
        user: {
          connect: { id: user.id },
        },
        date: new Date(),
      },
    });

    await this.mLimitService.addExpenseToLimitTotal(addedTransaction.amount, user_id);

    await this.mLimitService.ifLimitReachedSendAnEmail(user);

    console.log(`create transaction ${addedTransaction.id}`);

    return addedTransaction;
  }

  async getSingleTransaction(id: number, user_id: number) {
    const candidate = await this.prisma.transaction.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const type = await this.prisma.transactionType.findUnique({ where: { id: candidate.type_id } });

    const user = await this.prisma.user.findUnique({ where: { id: candidate.user_id } });

    const category = await this.prisma.transactionCategory.findUnique({ where: { id: candidate.category_id } });

    return this.mapper.mapTransactionToModel(candidate, user, category, type.name);
  }

  async removeTransaction(id: number, user_id: number) {
    const candidate = await this.prisma.transaction.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const deleted = await this.prisma.transaction.delete({ where: { id: id } });

    await this.mLimitService.removeExpenseFromLimitTotal(deleted.amount, user_id);

    console.log(`Delete transaction with id: ${deleted.id}`);

    return deleted;
  }

  async changeTransactionCategory(category: string, tr_id: number, user_id: number) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id: tr_id } });

    const categoryCandidateId = await this.categoriesService.ifCategoryExistsReturnsItsId(category, user_id);

    if (!transaction) {
      throw new HttpException('No objects found', 400);
    }

    if (categoryCandidateId === 0) {
      throw new HttpException('No categories found. Please create new category', 400);
    }

    if (transaction.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const changed = await this.prisma.transaction.update({
      where: { id: tr_id },
      data: { category_id: categoryCandidateId },
    });

    console.log(`Transaction category change for transaction ${changed.id}`);

    return changed;
  }

  async getTransactionsByTimeRange(user_id: number, timeRange: string) {
    const { startOfTime, endOfTime } = getTimeRangeStartAndEnd(timeRange);

    const user = await this.prisma.user.findUnique({ where: { id: user_id } });

    const candidates = await this.prisma.transaction.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: startOfTime.toISOString(),
          lte: endOfTime.toISOString(),
        },
      },
    });

    const { formatted, total } = await this.mapper.mapTransactionListToJSONModelList(candidates, user);

    console.log(`${candidates.length} transactions found by time range ${startOfTime} : ${endOfTime}`);

    return {
      total,
      list: formatted,
    };
  }

  private validateTranscationTypeOrThrow(type: string) {
    type = type.toUpperCase().trim();

    if (type === 'EXPENSE' || type === 'INCOME') {
      return type;
    } else {
      throw new HttpException('Incorrect transaction type (EXPENSE, INCOME)', 400);
    }
  }
}
