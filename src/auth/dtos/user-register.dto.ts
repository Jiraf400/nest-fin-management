import { IsEmail, IsString, Length } from 'class-validator';

export class UserRegisterDto {
	@IsString()
	@Length(2, 10)
	name: string;
	@IsEmail()
	email: string;
	@IsString()
	@Length(4, 18)
	password: string;
}
