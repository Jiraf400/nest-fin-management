import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Transaction, TransactionCategory, User } from '@prisma/client';
import { UserRegisterDto } from 'src/auth/dtos/user-register.dto';
import { AuthService } from '../auth/auth.service';
import { MonthlyLimitsService } from '../monthly-limits/monthly-limits.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { MonthlyLimitsNotifications } from '../utils/notifications/monthly-limits.notifications';
import { GetTransactionsDtoList } from './dto/get-list-transactions.dto';
import { GetTransactionDTO } from './dto/transactions-get.dto';
import { TransactionsDto } from './dto/transactions.dto';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
	let service: TransactionsService;
	let prisma: PrismaService;
	let authService: AuthService;
	let trCategoryService: TransactionCategoriesService;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				TransactionsService,
				TransactionCategoriesService,
				AuthService,
				JwtService,
				PrismaService,
				TransactionsMapper,
				MonthlyLimitsService,
				MonthlyLimitsNotifications,
			],
		}).compile();

		prisma = moduleRef.get(PrismaService);
		service = moduleRef.get(TransactionsService);
		authService = moduleRef.get(AuthService);
		trCategoryService = moduleRef.get(TransactionCategoriesService);
		await prisma.cleanDatabase(prisma.user);
		await prisma.cleanDatabase(prisma.transactionCategory);
		await prisma.cleanDatabase(prisma.transaction);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('addNewTransaction()', () => {
		it('should return created transaction', async () => {
			const userTemp: UserRegisterDto = {
				name: 'Bob',
				email: 'bob1@mail.com',
				password: 'pass1234',
			};

			const user: User = await authService.register(userTemp);

			const category: TransactionCategory = await trCategoryService.addNewCategory(
				{ name: 'pets' },
				user.id,
			);

			const trTemp: TransactionsDto = {
				amount: 100,
				description: 'test 1',
				category: category.name,
				type: 'EXPENSE',
			};

			const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

			expect(transaction.description).toEqual('test 1');
			expect(transaction.user_id).toEqual(user.id);
		});
		it('should throw (404) if user not found or category not set', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				const trTemp: TransactionsDto = {
					amount: 100,
					description: 'test 1',
					category: 'test400',
					type: 'EXPENSE',
				};

				await service.addNewTransaction(user.id, trTemp);
			} catch (error) {
				expect(error.status).toBe(404);
				expect(error.message).toBe('Transaction category not found');
			}
		});
	});
	describe('getSingleTransaction()', () => {
		it('should return one transaction', async () => {
			const user: User = <User>await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } });

			const category: TransactionCategory = await trCategoryService.addNewCategory(
				{ name: 'yellow' },
				user.id,
			);

			const trTemp: TransactionsDto = {
				amount: 100,
				description: 'test 2',
				category: category.name,
				type: 'EXPENSE',
			};

			const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

			const result: GetTransactionDTO = <GetTransactionDTO>(
				await service.getSingleTransaction(transaction.id, user.id)
			);

			expect(result.type).toEqual('EXPENSE');
			expect(result.category).toEqual(category.name);
		});
		it('should throw (404) if transaction not found', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				await service.getSingleTransaction(135432, user.id);
			} catch (error) {
				expect(error.status).toBe(404);
				expect(error.message).toBe('No objects found');
			}
		});
		it('should throw (401) cuz of user ids mismatch', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				const category: TransactionCategory = await trCategoryService.addNewCategory(
					{ name: 'blue' },
					user.id,
				);

				const trTemp: TransactionsDto = {
					amount: 100,
					description: 'test 3',
					category: category.name,
					type: 'EXPENSE',
				};

				const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

				await service.getSingleTransaction(transaction.id, 5324);
			} catch (error) {
				expect(error.status).toBe(401);
				expect(error.message).toBe('Access not allowed');
			}
		});
	});
	describe('removeTransaction()', () => {
		it('should return removed transaction', async () => {
			const user: User = <User>await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } });

			const category: TransactionCategory = await trCategoryService.addNewCategory(
				{ name: 'green' },
				user.id,
			);

			const trTemp: TransactionsDto = {
				amount: 100,
				description: 'test 3',
				category: category.name,
				type: 'EXPENSE',
			};

			const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

			const result: Transaction = await service.removeTransaction(transaction.id, user.id);

			expect(result.user_id).toEqual(user.id);
			expect(result.description).toEqual('test 3');
		});
		it('should throw (404) if transaction not found', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				await service.removeTransaction(135432, user.id);
			} catch (error) {
				expect(error.status).toBe(404);
				expect(error.message).toBe('No objects found');
			}
		});
		it('should throw (401) cuz of user ids mismatch', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				const category: TransactionCategory = await trCategoryService.addNewCategory(
					{ name: 'cyan' },
					user.id,
				);

				const trTemp: TransactionsDto = {
					amount: 100,
					description: 'test 4',
					category: category.name,
					type: 'EXPENSE',
				};

				const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

				await service.removeTransaction(transaction.id, 5324);
			} catch (error) {
				expect(error.status).toBe(401);
				expect(error.message).toBe('Access not allowed');
			}
		});
	});
	describe('changeTransactionCategory()', () => {
		it('should return changed transaction category', async () => {
			const user: User = <User>await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } });

			const category: TransactionCategory = await trCategoryService.addNewCategory(
				{ name: 'brown' },
				user.id,
			);

			const categoryToChange: TransactionCategory = await trCategoryService.addNewCategory(
				{ name: 'brownX' },
				user.id,
			);

			const categoryID: number = await trCategoryService.ifCategoryExistsReturnsItsId(
				'brownX',
				user.id,
			);

			const trTemp: TransactionsDto = {
				amount: 100,
				description: 'test 4',
				category: category.name,
				type: 'EXPENSE',
			};

			const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

			const result: Transaction = await service.changeTransactionCategory(
				categoryToChange.name,
				transaction.id,
				user.id,
			);

			expect(result.category_id).toEqual(categoryID);
			expect(result.description).toEqual('test 4');
		});
		it('should throw (404) if transaction not found', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				await service.changeTransactionCategory('some name', 135432, user.id);
			} catch (error) {
				expect(error.status).toBe(404);
				expect(error.message).toBe('No objects found');
			}
		});
		it('should throw (404) if transaction category not found', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				const category: TransactionCategory = await trCategoryService.addNewCategory(
					{ name: 'black' },
					user.id,
				);

				const trTemp: TransactionsDto = {
					amount: 100,
					description: 'test 5',
					category: category.name,
					type: 'EXPENSE',
				};

				const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

				await service.changeTransactionCategory('some name', transaction.id, user.id);
			} catch (error) {
				expect(error.status).toBe(404);
				expect(error.message).toBe('No categories found. Please create new category');
			}
		});
		it('should throw (401) cuz of user ids mismatch', async () => {
			try {
				const user: User = <User>(
					await prisma.user.findUnique({ where: { email: 'bob1@mail.com' } })
				);

				const userTemp: UserRegisterDto = {
					name: 'Bob2',
					email: 'bob2@mail.com',
					password: 'pass1234',
				};

				const anotherUser: User = await authService.register(userTemp);

				const category: TransactionCategory = await trCategoryService.addNewCategory(
					{ name: 'FISH' },
					user.id,
				);
				await trCategoryService.addNewCategory({ name: 'FISH' }, anotherUser.id);

				const trTemp: TransactionsDto = {
					amount: 100,
					description: 'test 6',
					category: category.name,
					type: 'EXPENSE',
				};

				const transaction: Transaction = await service.addNewTransaction(user.id, trTemp);

				await service.changeTransactionCategory(category.name, transaction.id, anotherUser.id);
			} catch (error) {
				expect(error.status).toBe(401);
				expect(error.message).toBe('Access not allowed');
			}
		});
	});
	describe('getTransactionsByTimeRange()', () => {
		it('should return transaction list by time range', async () => {
			const userTemp: UserRegisterDto = {
				name: 'Bill',
				email: 'bill@mail.com',
				password: 'pass1234',
			};

			const user: User = await authService.register(userTemp);

			const categoryForExpense: TransactionCategory = await trCategoryService.addNewCategory(
				{ name: 'beauty' },
				user.id,
			);
			const categoryForIncome: TransactionCategory = await trCategoryService.addNewCategory(
				{ name: 'salary' },
				user.id,
			);

			const incomeTemplate: TransactionsDto = {
				amount: 100,
				description: 'test 5',
				category: categoryForIncome.name,
				type: 'INCOME',
			};

			const expenseTemplate: TransactionsDto = {
				amount: 150,
				description: 'test 6',
				category: categoryForExpense.name,
				type: 'EXPENSE',
			};

			await service.addNewTransaction(user.id, incomeTemplate);
			await service.addNewTransaction(user.id, expenseTemplate);

			const result: GetTransactionsDtoList = await service.getTransactionsByTimeRange(
				user.id,
				'day',
			);

			expect(result.total_expenses).toEqual(150);
			expect(result.total_incomes).toEqual(100);
			expect(result.transactions.length).toEqual(2);
		});
		it('should throw (400) if timeRange is incorrect', async () => {
			try {
				await service.getTransactionsByTimeRange(1, 'banana');
			} catch (error) {
				expect(error.status).toBe(400);
				expect(error.message).toBe('Parameters allowed: day, week, month');
			}
		});
	});
	describe('validateTransactionTypeOrThrow()', () => {
		it('should return data if tr type is correct', async () => {
			const correctType = 'EXPENSE';

			const result = service['validateTransactionTypeOrThrow'](correctType);

			expect(result).toEqual('EXPENSE');
		});
		it('should throw (400) data if tr type is incorrect', async () => {
			try {
				const incorrectType = 'WATER';

				service['validateTransactionTypeOrThrow'](incorrectType);
			} catch (error) {
				expect(error.status).toBe(400);
				expect(error.message).toBe('Incorrect transaction type (EXPENSE, INCOME)');
			}
		});
	});
});
