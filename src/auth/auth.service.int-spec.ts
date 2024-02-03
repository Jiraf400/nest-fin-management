import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService, isEmailValid } from './auth.service';

describe('AuthService', () => {
	let authService: AuthService;
	let prisma: PrismaService;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [AuthService, JwtService, PrismaService],
		}).compile();

		prisma = moduleRef.get(PrismaService);
		authService = moduleRef.get(AuthService);
		await prisma.cleanDatabase(prisma.user);
	});

	it('should be defined', () => {
		expect(authService).toBeDefined();
	});

	describe('register()', () => {
		it('should create user', async () => {
			const user = await authService.register({
				name: 'John',
				email: 'johnx@gmail.com',
				password: 'password1',
			});
			expect(user.email).toBe('johnx@gmail.com');
		});
		it('should throw on duplicate email', async () => {
			try {
				await authService.register({
					name: 'John',
					email: 'johnx@gmail.com',
					password: 'password1',
				});
			} catch (error) {
				expect(error.status).toBe(400);
			}
		});
	});

	describe('login()', () => {
		it('should return access token', async () => {
			const correctUser = {
				email: 'johnx@gmail.com',
				password: 'password1',
			};

			const token = await authService.login(correctUser);
			expect(token).not.toBeNull();
		});
		it('should throw on credentials comparison', async () => {
			try {
				const userWithNoPassword = {
					email: 'johnx@gmail.com',
					password: 'UNKNOWN',
				};

				await authService.login(userWithNoPassword);
			} catch (error) {
				expect(error.status).toBe(400);
			}
		});
		it('should throw an exception on checking the existence of user', async () => {
			try {
				const userWithNoEmail = {
					email: 'UNKNOWN@gmail.com',
					password: 'password1',
				};

				await authService.login(userWithNoEmail);
			} catch (error) {
				expect(error.status).toBe(400);
			}
		});
	});

	describe('isEmailValid()', () => {
		const goodExample = 'bob@mail.com';
		const badExample = 'bob@.@mailcom';

		expect(isEmailValid(goodExample)).toBeTruthy();
		expect(isEmailValid(badExample)).toBeFalsy();
	});
});
