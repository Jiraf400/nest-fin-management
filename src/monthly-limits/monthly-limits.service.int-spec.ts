import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { MonthlyLimit, User } from '@prisma/client';
import { UserRegisterDto } from 'src/auth/dtos/user-register.dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyLimitsNotifications } from '../utils/notifications/monthly-limits.notifications';
import { MonthlyLimitDTO } from './dto/monthly-limit.dto';
import { MonthlyLimitsService } from './monthly-limits.service';

describe('MonthlyLimitsService', () => {
	let service: MonthlyLimitsService;
	let prisma: PrismaService;
	let authService: AuthService;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				MonthlyLimitsService,
				MonthlyLimitsNotifications,
				PrismaService,
				AuthService,
				JwtService,
			],
		}).compile();

		prisma = moduleRef.get(PrismaService);
		service = moduleRef.get(MonthlyLimitsService);
		authService = moduleRef.get(AuthService);
		await prisma.cleanDatabase(prisma.monthlyLimit);
		await prisma.cleanDatabase(prisma.user);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('addNewMonthLimit()', () => {
		it('should create new monthly limit object', async () => {
			const userObj: UserRegisterDto = {
				name: 'John',
				email: 'mlimittest1@mail.com',
				password: 'pass1234',
			};

			const limitDTO: MonthlyLimitDTO = {
				limit_amount: 1000,
			};

			const user: User = await authService.register(userObj);

			const limit: MonthlyLimit = await service.addMonthLimit(limitDTO, user.id);

			expect(limit.user_id).toEqual(user.id);
			expect(limit.limit_amount).toEqual(1000);
		});
		it('should throw 400 if monthly limit already set to user', async () => {
			try {
				const limitDTO: MonthlyLimitDTO = {
					limit_amount: 1000,
				};

				const user: User = <User>await prisma.user.findUnique({
					where: { email: 'mlimittest1@mail.com' },
				});

				await service.addMonthLimit(limitDTO, user.id);
				await service.addMonthLimit(limitDTO, user.id);
			} catch (error) {
				expect(error.status).toBe(400);
				expect(error.message).toBe(
					'Monthly limit has already been set. Able only to delete or update amount',
				);
			}
		});
	});
	describe('changeLimitAmount()', () => {
		it('should change monthly limit amount', async () => {
			const userObj: UserRegisterDto = {
				name: 'John',
				email: 'mlimittest2@mail.com',
				password: 'pass1234',
			};

			const user: User = await authService.register(userObj);

			const limitDTO: MonthlyLimitDTO = {
				limit_amount: 1000,
			};

			const limit: MonthlyLimit = await service.addMonthLimit(limitDTO, user.id);

			const changed: MonthlyLimit = await service.changeLimitAmount(2000, user.id, limit.id);

			expect(changed.limit_amount).toEqual(2000);
			expect(changed.user_id).toEqual(user.id);
		});
		it('should throw 400 if monthly limit object not found', async () => {
			try {
				await service.changeLimitAmount(2000, 123, 123);
			} catch (error) {
				expect(error.status).toBe(400);
				expect(error.message).toBe('Monthly limit object not found');
			}
		});
		it('should throw 400 on ids comparison', async () => {
			try {
				const userFromDb: User = <User>await prisma.user.findUnique({
					where: { email: 'mlimittest2@mail.com' },
				});
				const limitFromDB: MonthlyLimit = <MonthlyLimit>await prisma.monthlyLimit.findUnique({
					where: { user_id: userFromDb.id },
				});

				await service.changeLimitAmount(2000, 123, limitFromDB.id);
			} catch (error) {
				expect(error.status).toBe(401);
				expect(error.message).toBe('Access not allowed');
			}
		});
	});
	describe('deleteExpenseLimit()', () => {
		it('should delete monthly limit object', async () => {
			const userObj: UserRegisterDto = {
				name: 'John',
				email: 'mlimittest3@mail.com',
				password: 'pass1234',
			};

			const user: User = <User>await authService.register(userObj);

			const limitDTO: MonthlyLimitDTO = {
				limit_amount: 1000,
			};

			const limit: MonthlyLimit = await service.addMonthLimit(limitDTO, user.id);

			const deleted: MonthlyLimit = await service.deleteMonthLimit(limit.id, user.id);

			expect(deleted.limit_amount).toEqual(1000);
			expect(deleted.user_id).toEqual(user.id);
		});
		it('should throw 400 if monthly limit object not found', async () => {
			try {
				const user: User = <User>await prisma.user.findUnique({
					where: { email: 'mlimittest3@mail.com' },
				});

				const limitDTO: MonthlyLimitDTO = {
					limit_amount: 1000,
				};

				await service.addMonthLimit(limitDTO, user.id);

				await service.deleteMonthLimit(5678, user.id);
			} catch (error) {
				expect(error.status).toBe(400);
				expect(error.message).toBe('No objects found');
			}
		});
		it('should throw 400 on ids comparison', async () => {
			try {
				const userObj: UserRegisterDto = {
					name: 'John',
					email: 'mlimittestX@mail.com',
					password: 'pass1234',
				};

				const user: User = await authService.register(userObj);

				const limitDTO: MonthlyLimitDTO = {
					limit_amount: 1000,
				};

				const limit: MonthlyLimit = await service.addMonthLimit(limitDTO, user.id);

				await service.deleteMonthLimit(limit.id, 5678);
			} catch (error) {
				expect(error.status).toBe(401);
				expect(error.message).toBe('Access not allowed');
			}
		});
	});
	describe('addExpenseToLimitTotal()', () => {
		it('should add expense to monthly limit "total" field', async () => {
			const userObj: UserRegisterDto = {
				name: 'John',
				email: 'mlimittest4@mail.com',
				password: 'pass1234',
			};

			const user: User = await authService.register(userObj);

			const limitDTO: MonthlyLimitDTO = {
				limit_amount: 5000,
			};

			await service.addMonthLimit(limitDTO, user.id);

			const updated: MonthlyLimit = <MonthlyLimit>(
				await service.addExpenseToLimitTotalIfExists(300, user.id)
			);

			expect(updated.total_expenses).toEqual(300);
			expect(updated.user_id).toEqual(user.id);
		});
	});
	describe('removeExpenseFromLimitTotal()', () => {
		it('should remove expense amount from monthly limit', async () => {
			const userObj: UserRegisterDto = {
				name: 'John',
				email: 'mlimittest5@mail.com',
				password: 'pass1234',
			};

			const user: User = await authService.register(userObj);

			const limitDTO: MonthlyLimitDTO = {
				limit_amount: 5000,
			};

			await service.addMonthLimit(limitDTO, user.id);

			await service.addExpenseToLimitTotalIfExists(2000, user.id);
			const updated: MonthlyLimit = <MonthlyLimit>(
				await service.removeExpenseFromLimitTotalIfExists(500, user.id)
			);

			expect(updated.total_expenses).toEqual(1500);
			expect(updated.user_id).toEqual(user.id);
		});
	});
});
