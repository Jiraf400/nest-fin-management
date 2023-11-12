import { IsString, Length } from 'class-validator';

export class CategoryDTO {
  @IsString()
  @Length(2, 20)
  name: string;
}
