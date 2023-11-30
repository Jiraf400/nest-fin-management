import { IsInt, IsNotEmpty } from 'class-validator';

export class MonthlyLimitDTO {
  @IsNotEmpty({ message: 'amount is required' })
  @IsInt()
  limit_amount: number;
}
