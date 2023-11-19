import { IsString, Length } from 'class-validator';

export class ExpenseCategoryDto {
  @IsString()
  @Length(2, 20)
  name: string;
}
