import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class TransactionValidator {
	validateTransactionTypeOrThrow(type: string): string {
		type = type.toUpperCase().trim();

		if (type === 'EXPENSE' || type === 'INCOME') {
			return type;
		} else {
			throw new HttpException('Incorrect transaction type (EXPENSE, INCOME)', 400);
		}
	}
}
