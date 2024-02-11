import { HttpException, Injectable } from '@nestjs/common';
import { Transaction, TransactionCategory, TransactionType, User } from '@prisma/client';
import { MonthlyLimitsService } from '../monthly-limits/monthly-limits.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { RedisService } from '../utils/cache/redis.service';
import { TimeRangeDto } from '../utils/timerange/dtos/timerange.dto';
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
		private redis: RedisService,
	) {}

	async addNewTransaction(user_id: number, trDto: TransactionsDto): Promise<Transaction> {
		const categoryCandidateId: number = await this.categoriesService.ifCategoryExistsReturnsItsId(
			trDto.category,
			user_id,
		);

		if (categoryCandidateId === 0) {
			throw new HttpException('Transaction category not found', 404);
		}

		const trType: string = this.validateTransactionTypeOrThrow(trDto.type);

		const user: User = <User>await this.prisma.user.findUnique({ where: { id: user_id } });

		if (!user) {
			throw new HttpException('User not found', 404);
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

		await this.redis.setValueToCache(`${addedTransaction.id}`, JSON.stringify(addedTransaction));

		await this.resetAllCachedLists(user_id, addedTransaction.category_id);

		await this.mLimitService.addExpenseToLimitTotalIfExists(addedTransaction.amount, user_id);

		await this.mLimitService.ifLimitReachedSendAnEmail(user);

		console.log(`create transaction ${addedTransaction.id}`);

		return addedTransaction;
	}

	async getSingleTransaction(id: number, user_id: number): Promise<GetTransactionDTO> {
		let transactionModel: GetTransactionDTO = JSON.parse(
			<string>await this.redis.getValueFromCache(`${user_id}: ${id}`),
		);

		if (!transactionModel) {
			const transaction = <Transaction>(
				await this.prisma.transaction.findUnique({ where: { id: id } })
			);

			if (!transaction) {
				throw new HttpException('No objects found', 404);
			}

			if (transaction.user_id !== user_id) {
				throw new HttpException('Access not allowed', 401);
			}

			const type: TransactionType = <TransactionType>(
				await this.prisma.transactionType.findUnique({ where: { id: transaction.type_id } })
			);

			const user: User = <User>(
				await this.prisma.user.findUnique({ where: { id: transaction.user_id } })
			);

			const category: TransactionCategory = <TransactionCategory>(
				await this.prisma.transactionCategory.findUnique({ where: { id: transaction.category_id } })
			);

			transactionModel = this.mapper.mapTransactionToModel(transaction, user, category, type.name);

			await this.redis.setValueToCache(`${user_id}: ${id}`, JSON.stringify(transactionModel));
		}

		return transactionModel;
	}

	async removeTransaction(id: number, user_id: number): Promise<Transaction> {
		const candidate: Transaction = <Transaction>(
			await this.prisma.transaction.findUnique({ where: { id: id } })
		);

		if (!candidate) {
			throw new HttpException('No objects found', 404);
		}

		if (candidate.user_id !== user_id) {
			throw new HttpException('Access not allowed', 401);
		}

		const deleted: Transaction = await this.prisma.transaction.delete({ where: { id: id } });

		await this.redis.deleteValueFromCache(`${user_id}: ${id}`);

		await this.resetAllCachedLists(user_id, deleted.category_id);

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
			throw new HttpException('No objects found', 404);
		}

		if (categoryCandidateId === 0) {
			throw new HttpException('No categories found. Please create new category', 404);
		}

		if (transaction.user_id !== user_id) {
			throw new HttpException('Access not allowed', 401);
		}

		const changed: Transaction = await this.prisma.transaction.update({
			where: { id: tr_id },
			data: { category_id: categoryCandidateId },
		});

		await this.redis.deleteValueFromCache(`${user_id}: ${changed.id}`);

		await this.resetAllCachedLists(user_id, changed.category_id);

		await this.redis.setValueToCache(`${user_id}: ${changed.id}`, JSON.stringify(changed));

		console.log(`Transaction category change for transaction ${changed.id}`);

		return changed;
	}

	async getTransactionsByTimeRange(
		user_id: number,
		timeRange: string,
	): Promise<GetTransactionsDtoList> {
		const timeRangeDto: TimeRangeDto = getTimeRangeStartAndEnd(timeRange);

		if (!timeRangeDto.isTimeRangeCorrect) {
			throw new HttpException('Parameters allowed: day, week, month', 400);
		}

		let transactionDtoList: GetTransactionsDtoList = JSON.parse(
			<string>await this.redis.getValueFromCache(`${user_id}: ${timeRange}`),
		);

		if (!transactionDtoList) {
			console.log(`LOG: transactionList not found in cache by timerange ${timeRange}`);

			const user: User = <User>await this.prisma.user.findUnique({ where: { id: user_id } });

			if (!user) {
				throw new HttpException('User not found', 404);
			}

			const transactionList = await this.prisma.transaction.findMany({
				where: {
					user_id: user.id,
					date: {
						gte: timeRangeDto.startOfTime.toISOString(),
						lte: timeRangeDto.endOfTime.toISOString(),
					},
				},
			});

			transactionDtoList = await this.mapper.mapTransactionListToJSONModelList(
				transactionList,
				user,
			);

			await this.redis.setValueToCache(
				`${user.id}: ${timeRange}`,
				JSON.stringify(transactionDtoList),
			);
		}

		console.log(
			`${transactionDtoList.transactions.length} transactions found by time range ${timeRangeDto.startOfTime} : ` +
				`${timeRangeDto.endOfTime}`,
		);

		return transactionDtoList;
	}

	async getTransactionsByCategory(user_id: number, category: string) {
		category = category.toUpperCase().trim();

		const categoryId: number = await this.categoriesService.ifCategoryExistsReturnsItsId(
			category,
			user_id,
		);

		if (categoryId === 0) {
			throw new HttpException('No categories found. Please create new category', 404);
		}

		let transactionDtoList: GetTransactionsDtoList = JSON.parse(
			<string>await this.redis.getValueFromCache(`${user_id}: ct ${categoryId}`),
		);

		if (!transactionDtoList) {
			console.log(`LOG: transactionList not found in cache by category ${categoryId}`);

			const user: User = <User>await this.prisma.user.findUnique({ where: { id: user_id } });

			if (!user) {
				throw new HttpException('User not found', 404);
			}

			const transactionList = await this.prisma.transaction.findMany({
				where: {
					user_id: user.id,
					category: { name: category },
				},
			});

			transactionDtoList = await this.mapper.mapTransactionListToJSONModelList(
				transactionList,
				user,
			);

			await this.redis.setValueToCache(
				`${user_id}: ct ${categoryId}`,
				JSON.stringify(transactionDtoList),
			);
		}

		return transactionDtoList;
	}

	private validateTransactionTypeOrThrow(type: string): string {
		type = type.toUpperCase().trim();

		if (type === 'EXPENSE' || type === 'INCOME') {
			return type;
		} else {
			throw new HttpException('Incorrect transaction type (EXPENSE, INCOME)', 400);
		}
	}

	private async resetAllCachedLists(user_id: number, category_id?: number) {
		//for timeRange
		await this.redis.deleteValueFromCache(`${user_id}: day`);
		await this.redis.deleteValueFromCache(`${user_id}: week`);
		await this.redis.deleteValueFromCache(`${user_id}: month`);

		//for categories
		await this.redis.deleteValueFromCache(`${user_id}: ct ${category_id}`);
	}
}
