import { IsString, Length } from 'class-validator';

export class TransactionsCategoryDTO {
  @IsString()
  @Length(2, 20)
  name: string;
}
