import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as process from 'process';
import { PrismaService } from '../prisma/prisma.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegisterDto } from './dtos/user-register.dto';

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private prisma: PrismaService
	) {}

	async register(registerDto: UserRegisterDto) {
		const duplicate = await this.prisma.user.findUnique({
			where: { email: registerDto.email },
		});

		if (duplicate) {
			throw new HttpException('User already exists', 400);
		}

		registerDto.password = await bcrypt.hash(registerDto.password, 8);

		const created: PrismaUser = await this.prisma.user.create({
			data: registerDto,
		});

		console.log(`Create user ${created.id}`);

		return created;
	}

	async login(loginDto: UserLoginDto): Promise<string> {
		const candidate = await this.prisma.user.findUnique({
			where: { email: loginDto.email },
		});

		if (!candidate) {
			throw new HttpException('User not exists', 400);
		}

		const match = await bcrypt.compare(loginDto.password, candidate.password);

		if (!match) {
			throw new HttpException('Failed to match credentials', 400);
		}

		console.log(`Create token for user ${loginDto.email}`);

		const accessToken: string = await this.generateJwtToken(
			loginDto.email,
			candidate.id
		);

		return accessToken;
	}

	async generateJwtToken(email: string, candidate_id: number): Promise<string> {
		const payload = { email: email, sub: candidate_id };

		return await this.jwt.signAsync(payload, {
			secret: `${process.env.JWT_SECRET}`,
		});
	}
}

export function isEmailValid(email: any): boolean {
	const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

	return expression.test(email);
}
