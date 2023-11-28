import { IsInt, IsNotEmpty, Length } from 'class-validator';

export class TransactionsDto {
  @IsNotEmpty({ message: 'amount is required' })
  @IsInt()
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
