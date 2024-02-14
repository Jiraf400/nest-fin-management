import { IsNotEmpty, IsPositive } from 'class-validator';

export class MonthlyLimitDTO {
	@IsNotEmpty({ message: 'limit_amount field is required' })
	@IsPositive()
	@IsNotEmpty()
	limit_amount: number;
}
