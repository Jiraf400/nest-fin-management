import { IsInt, IsNotEmpty, Length, Min } from 'class-validator';

export class TransactionsDto {
	@IsNotEmpty({ message: 'amount is required' })
	@IsInt()
	@Min(1)
	amount: number;
	@IsNotEmpty()
	@Length(3, 255)
	description: string;
	@IsNotEmpty()
	@Length(3, 255)
	type: string;
	@IsNotEmpty()
	@Length(3, 15)
	category: string;
}
