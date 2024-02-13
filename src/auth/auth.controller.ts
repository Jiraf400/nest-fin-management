import { Body, Controller, Post, Res } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegisterDto } from './dtos/user-register.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async registerNewUser(
		@Res() res: Response,
		@Body() registerDto: UserRegisterDto,
	): Promise<Response> {
		const createdUser: PrismaUser = await this.authService.register(registerDto);

		return res.status(201).json({
			status: 'OK',
			message: 'Successfully register new user',
			body: createdUser,
		});
	}

	@Post('login')
	async loginUser(@Res() res: Response, @Body() loginDto: UserLoginDto): Promise<Response> {
		const access_token: string = await this.authService.login(loginDto);

		return res.status(200).json({ accessToken: access_token });
	}
}
