import { Injectable } from '@nestjs/common';
import { Transaction, TransactionCategory, TransactionType, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetTransactionsDtoList } from '../dto/get-list-transactions.dto';
import { GetTransactionDTO } from '../dto/transactions-get.dto';

@Injectable()
export class TransactionsMapper {
	constructor(private prisma: PrismaService) {}

	async mapTransactionListToJSONModelList(
		candidates: Transaction[],
		user: any,
	): Promise<GetTransactionsDtoList> {
		let total_expenses = 0;
		let total_incomes = 0;
		let type = '';

		const formatted: GetTransactionDTO[] = [];

		for (const tr of candidates) {
			const trType: TransactionType = <TransactionType>(
				await this.prisma.transactionType.findUnique({ where: { id: tr.type_id } })
			);

			if (trType.name === 'EXPENSE') {
				total_expenses += tr.amount;
			} else {
				total_incomes += tr.amount;
			}

			type = trType.name;

			const category: TransactionCategory = <TransactionCategory>(
				await this.prisma.transactionCategory.findUnique({ where: { id: tr.category_id } })
			);
			const unit = this.mapTransactionToModel(tr, user, category, type);

			formatted.push(unit);
		}

		const listToGet: GetTransactionsDtoList = new GetTransactionsDtoList();
		listToGet.transactions = formatted;
		listToGet.total_expenses = total_expenses;
		listToGet.total_incomes = total_incomes;

		return listToGet;
	}

	mapTransactionToModel(
		tr: Transaction,
		u: User,
		cat: TransactionCategory,
		type: string,
	): GetTransactionDTO {
		const model = new GetTransactionDTO();
		model.user = u.name;
		model.category = cat.name;
		model.amount = tr.amount;
		model.description = tr.description;
		model.date = tr.date.toLocaleString();
		model.type = type;
		return model;
	}
}
