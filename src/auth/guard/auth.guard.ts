import {
	CanActivate,
	ExecutionContext,
	HttpException,
	Injectable,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as process from 'process';
import { UserFromToken } from 'src/utils/dtos/user-token.dto';

type AuthGuardType = {
	email: string;
	sub: number;
	iat: number;
	exp: number;
};

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new HttpException('Invalid token', 401);
		}
		try {
			const payload: AuthGuardType = await this.jwtService.verifyAsync(token, {
				secret: `${process.env.JWT_SECRET}`,
			});

			request.body.user = <UserFromToken>{
				email: payload.email,
				id: payload.sub,
			};
		} catch (e: unknown) {
			if (e instanceof JsonWebTokenError) {
				throw new HttpException('Failed to recognize token signature', 401);
			} else {
				throw new HttpException('Authorization failed', 400);
			}
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
