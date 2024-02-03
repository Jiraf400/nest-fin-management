import { IsString, Length } from 'class-validator';

export class CreateCategoryDTO {
	@IsString()
	@Length(2, 20)
	name: string;
}
