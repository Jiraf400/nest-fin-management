import { Injectable } from '@nestjs/common';
import { Transaction, TransactionCategory, TransactionType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetTransactionsDtoList } from '../dto/get-list-transactions.dto';
import { GetTransactionDTO } from '../dto/transactions-get.dto';

@Injectable()
export class TransactionsMapper {
	constructor(private prisma: PrismaService) {}

	async mapTransactionListToJSONModelList(
		transactionList: Transaction[],
		user: User,
	): Promise<GetTransactionsDtoList> {
		let total_expenses = 0;
		let total_incomes = 0;

		const formatted: GetTransactionDTO[] = [];

		for (const transaction of transactionList) {
			const transactionType: TransactionType = await this.getTransactionTypeById(
				transaction.type_id,
			);

			if (transactionType.name === 'EXPENSE') {
				total_expenses += transaction.amount;
			} else {
				total_incomes += transaction.amount;
			}

			const transactionCategory: TransactionCategory = await this.getTransactionCategoryById(
				transaction.category_id,
			);

			const unit = this.mapTransactionToModel(
				transaction,
				user,
				transactionCategory,
				transactionType,
			);

			formatted.push(unit);
		}

		const listToGet: GetTransactionsDtoList = new GetTransactionsDtoList();
		listToGet.transactions = formatted;
		listToGet.total_expenses = total_expenses;
		listToGet.total_incomes = total_incomes;

		return listToGet;
	}

	mapTransactionToModel(
		transaction: Transaction,
		user: User,
		category: TransactionCategory,
		type: TransactionType,
	): GetTransactionDTO {
		const model = new GetTransactionDTO();
		model.user = user.name;
		model.category = category.name;
		model.amount = transaction.amount;
		model.description = transaction.description;
		model.date = transaction.date.toLocaleString();
		model.type = type.name;
		return model;
	}

	async getTransactionTypeById(trTypeId: number): Promise<TransactionType> {
		const trType: TransactionType = <TransactionType>(
			await this.prisma.transactionType.findUnique({ where: { id: trTypeId } })
		);

		return trType;
	}

	async getTransactionCategoryById(trCategoryId: number): Promise<TransactionCategory> {
		const category: TransactionCategory = <TransactionCategory>(
			await this.prisma.transactionCategory.findUnique({ where: { id: trCategoryId } })
		);

		return category;
	}
}
