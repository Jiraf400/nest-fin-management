import { IsInt, IsNotEmpty, Length } from 'class-validator';

export class CreateIncomeDto {
  @IsNotEmpty({ message: 'amount is required' })
  @IsInt()
  amount: number;
  @IsNotEmpty({ message: 'amount is required' })
  @Length(3, 15)
  category: string;
}
