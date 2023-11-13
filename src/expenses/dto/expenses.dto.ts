import { IsInt, IsNotEmpty, Length } from 'class-validator';

export class CreateExpenseDTO {
  @IsNotEmpty({ message: 'amount is required' })
  @IsInt()
  amount: number;
  date: Date | string;
  @IsNotEmpty()
  @Length(3, 255)
  description: string;
  @IsNotEmpty()
  @Length(3, 15)
  category: string;
}
