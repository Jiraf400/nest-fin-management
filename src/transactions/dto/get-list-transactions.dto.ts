import { GetTransactionDTO } from './transactions-get.dto';

export class GetTransactionsDtoList {
	transactions: GetTransactionDTO[];
	total_expenses: number;
	total_incomes: number;
}
