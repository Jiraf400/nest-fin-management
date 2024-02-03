import { HttpException, Injectable } from '@nestjs/common';
import { Transaction, TransactionCategory, TransactionType, User } from '@prisma/client';
import { MonthlyLimitsService } from '../monthly-limits/monthly-limits.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { getTimeRangeStartAndEnd } from '../utils/timerange/timeRange.func';
import { GetTransactionsDtoList } from './dto/get-list-transactions.dto';
import { GetTransactionDTO } from './dto/transactions-get.dto';
import { TransactionsDto } from './dto/transactions.dto';
import { TransactionsMapper } from './mappers/transactions.mapper';

@Injectable()
export class TransactionsService {
	constructor(
		private prisma: PrismaService,
		private mapper: TransactionsMapper,
		private categoriesService: TransactionCategoriesService,
		private mLimitService: MonthlyLimitsService,
	) {}

	async addNewTransaction(user_id: number, trDto: TransactionsDto): Promise<Transaction> {
		const categoryCandidateId: number = await this.categoriesService.ifCategoryExistsReturnsItsId(
			trDto.category,
			user_id,
		);

		const trType: string = this.validateTransactionTypeOrThrow(trDto.type);

		const user: User = <User>await this.prisma.user.findUnique({ where: { id: user_id } });

		if (!user || categoryCandidateId === 0) {
			throw new HttpException('Cannot add transaction with such parameters', 400);
		}

		const addedTransaction: Transaction = await this.prisma.transaction.create({
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

		await this.mLimitService.addExpenseToLimitTotalIfExists(addedTransaction.amount, user_id);

		await this.mLimitService.ifLimitReachedSendAnEmail(user);

		console.log(`create transaction ${addedTransaction.id}`);

		return addedTransaction;
	}

	async getSingleTransaction(id: number, user_id: number): Promise<GetTransactionDTO> {
		const candidate: Transaction = <Transaction>(
			await this.prisma.transaction.findUnique({ where: { id: id } })
		);

		if (!candidate) {
			throw new HttpException('No objects found', 400);
		}

		if (candidate.user_id !== user_id) {
			throw new HttpException('Access not allowed', 401);
		}

		const type: TransactionType = <TransactionType>(
			await this.prisma.transactionType.findUnique({ where: { id: candidate.type_id } })
		);

		const user: User = <User>(
			await this.prisma.user.findUnique({ where: { id: candidate.user_id } })
		);

		const category: TransactionCategory = <TransactionCategory>(
			await this.prisma.transactionCategory.findUnique({ where: { id: candidate.category_id } })
		);

		return this.mapper.mapTransactionToModel(candidate, user, category, type.name);
	}

	async removeTransaction(id: number, user_id: number): Promise<Transaction> {
		const candidate: Transaction = <Transaction>(
			await this.prisma.transaction.findUnique({ where: { id: id } })
		);

		if (!candidate) {
			throw new HttpException('No objects found', 400);
		}

		if (candidate.user_id !== user_id) {
			throw new HttpException('Access not allowed', 401);
		}

		const deleted: Transaction = await this.prisma.transaction.delete({ where: { id: id } });

		await this.mLimitService.removeExpenseFromLimitTotalIfExists(deleted.amount, user_id);

		console.log(`Delete transaction with id: ${deleted.id}`);

		return deleted;
	}

	async changeTransactionCategory(
		category: string,
		tr_id: number,
		user_id: number,
	): Promise<Transaction> {
		const transaction: Transaction = <Transaction>(
			await this.prisma.transaction.findUnique({ where: { id: tr_id } })
		);

		const categoryCandidateId: number = await this.categoriesService.ifCategoryExistsReturnsItsId(
			category,
			user_id,
		);

		if (!transaction) {
			throw new HttpException('No objects found', 400);
		}

		if (categoryCandidateId === 0) {
			throw new HttpException('No categories found. Please create new category', 400);
		}

		if (transaction.user_id !== user_id) {
			throw new HttpException('Access not allowed', 401);
		}

		const changed: Transaction = await this.prisma.transaction.update({
			where: { id: tr_id },
			data: { category_id: categoryCandidateId },
		});

		console.log(`Transaction category change for transaction ${changed.id}`);

		return changed;
	}

	async getTransactionsByTimeRange(
		user_id: number,
		timeRange: string,
	): Promise<GetTransactionsDtoList> {
		const { startOfTime, endOfTime } = getTimeRangeStartAndEnd(timeRange);

		const user: User = <User>await this.prisma.user.findUnique({ where: { id: user_id } });

		const candidates: Transaction[] = await this.prisma.transaction.findMany({
			where: {
				user_id: user.id,
				date: {
					gte: startOfTime.toISOString(),
					lte: endOfTime.toISOString(),
				},
			},
		});

		const listOfTransactions: GetTransactionsDtoList =
			await this.mapper.mapTransactionListToJSONModelList(candidates, user);

		console.log(
			`${candidates.length} transactions found by time range ${startOfTime} : ${endOfTime}`,
		);

		return listOfTransactions;
	}

	private validateTransactionTypeOrThrow(type: string): string {
		type = type.toUpperCase().trim();

		if (type === 'EXPENSE' || type === 'INCOME') {
			return type;
		} else {
			throw new HttpException('Incorrect transaction type (EXPENSE, INCOME)', 400);
		}
	}
}
