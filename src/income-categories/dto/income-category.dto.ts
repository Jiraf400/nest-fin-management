import { IsString, Length } from 'class-validator';

export class IncomeCategoryDto {
  @IsString()
  @Length(2, 20)
  name: string;
}
