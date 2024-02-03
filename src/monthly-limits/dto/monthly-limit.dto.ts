import { IsInt, IsNotEmpty } from 'class-validator';

export class MonthlyLimitDTO {
	@IsNotEmpty({ message: 'limit_amount field is required' })
	@IsInt()
	limit_amount: number;
}
