import { HttpException, Injectable } from '@nestjs/common';
import { Transaction, TransactionCategory, TransactionType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetTransactionDTO } from '../dto/transactions-get.dto';
import { TransactionsMapper } from '../mappers/transactions.mapper';

@Injectable()
export class TransactionFetcher {
	constructor(
		private prisma: PrismaService,
		private mapper: TransactionsMapper,
	) {}

	async fetchRelatedEntitiesAndMapToModel(transaction: Transaction): Promise<GetTransactionDTO> {
		const type: TransactionType = <TransactionType>(
			await this.prisma.transactionType.findUnique({ where: { id: transaction.type_id } })
		);

		const user: User = <User>(
			await this.prisma.user.findUnique({ where: { id: transaction.user_id } })
		);

		const category: TransactionCategory = <TransactionCategory>(
			await this.prisma.transactionCategory.findUnique({ where: { id: transaction.category_id } })
		);

		if (!type || !user || !category) {
			throw new HttpException('Some related entities not found', 404);
		}

		return this.mapper.mapTransactionToModel(transaction, user, category, type);
	}
}
