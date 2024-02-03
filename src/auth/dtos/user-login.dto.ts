import { IsEmail, IsString, Length } from 'class-validator';

export class UserLoginDto {
	@IsEmail()
	email: string;
	@IsString()
	@Length(4, 18)
	password: string;
}
