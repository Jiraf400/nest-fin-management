import { ArgumentMetadata, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Transaction } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { CreateCategoryDTO } from 'src/transaction-categories/dto/create-category.dto';
import { MonthlyLimitsService } from '../monthly-limits/monthly-limits.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { RedisService } from '../utils/cache/redis.service';
import { MonthlyLimitsNotifications } from '../utils/notifications/monthly-limits.notifications';
import { GetTransactionsDtoList } from './dto/get-list-transactions.dto';
import { GetTransactionDTO } from './dto/transactions-get.dto';
import { TransactionsDto } from './dto/transactions.dto';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { TransactionRedisHelper } from './related/transaction-cache.helper';
import { TransactionFetcher } from './related/transaction.fetcher';
import { TransactionValidator } from './related/transaction.validator';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
	let controller: TransactionsController;
	let service: TransactionsService;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [TransactionsController],
			providers: [
				TransactionsService,
				PrismaService,
				JwtService,
				TransactionsMapper,
				MonthlyLimitsService,
				TransactionCategoriesService,
				MonthlyLimitsNotifications,
				TransactionFetcher,
				TransactionValidator,
				TransactionRedisHelper,
				RedisService,
			],
		}).compile();

		service = module.get(TransactionsService);
		controller = module.get(TransactionsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('createTransaction()', () => {
		it('should return 201 with created transaction body', async () => {
			const transactionDTO: TransactionsDto = {
				amount: 100,
				description: '',
				type: 'EXPENSE',
				category: 'pets',
			};

			const transaction: Transaction = {
				id: 1,
				category_id: 1,
				type_id: 1,
				description: '',
				user_id: 1,
				date: new Date(),
				amount: 100,
			};

			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			jest.spyOn(service, 'addNewTransaction').mockResolvedValue(transaction);

			await controller.createTransaction(mockRequest, mockResponse, transactionDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: 'Successfully add new transaction',
				body: transaction,
			});
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.createTransaction(mockRequest, mockResponse, {} as TransactionsDto);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
		it('should return 400 if dto is empty or invalid', async () => {
			const trDto: TransactionsDto = {
				amount: -100,
				description: 'a',
				type: '1',
				category: 'cats',
			};

			const dtoCheck = plainToInstance(TransactionsDto, trDto);
			const errors = await validate(dtoCheck);
			expect(errors.length).not.toBe(0);
		});
	});
	describe('getSingleTransaction()', () => {
		it('should return 200 with transaction body', async () => {
			const transaction: GetTransactionDTO = {
				description: '',
				date: new Date(),
				amount: 100,
				user: 'USER',
				category: 'CATEGORY',
				type: 'TYPE',
			};

			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			jest.spyOn(service, 'getSingleTransaction').mockResolvedValue(transaction);

			await controller.getSingleTransaction(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: 'Success',
				body: transaction,
			});
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.getSingleTransaction(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
	});
	describe('getTransactionsByTimeRange()', () => {
		it('should return 200 with transaction list', async () => {
			const list: GetTransactionDTO[] = [
				{
					user: 'John',
					type: 'EXPENSE',
					amount: 100,
					date: new Date(),
					category: 'PETS',
					description: '',
				},
			];

			const generated: GetTransactionsDtoList = {
				total_expenses: 100,
				total_incomes: 0,
				transactions: list,
			};

			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			jest.spyOn(service, 'getTransactionsByTimeRange').mockResolvedValue(generated);

			await controller.getTransactionsByTimeRange(mockRequest, mockResponse, 'day');

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(generated);
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.getTransactionsByTimeRange(mockRequest, mockResponse, 'timerange');

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
	});
	describe('getTransactionsByCategory()', () => {
		it('should return 200 with transaction list', async () => {
			const list: GetTransactionDTO[] = [
				{
					user: 'John',
					type: 'EXPENSE',
					amount: 100,
					date: new Date(),
					category: 'PETS',
					description: '',
				},
			];

			const generated: GetTransactionsDtoList = {
				total_expenses: 100,
				total_incomes: 0,
				transactions: list,
			};

			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			jest.spyOn(service, 'getTransactionsByCategory').mockResolvedValue(generated);

			await controller.getTransactionsByCategory(mockRequest, mockResponse, 'category');

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(generated);
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.getTransactionsByCategory(mockRequest, mockResponse, 'category');

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
	});
	describe('getTransactionsBySearchQuery()', () => {
		it('should return 200 with transaction list', async () => {
			const list: GetTransactionDTO[] = [
				{
					user: 'John',
					type: 'EXPENSE',
					amount: 100,
					date: new Date(),
					category: 'PETS',
					description: '',
				},
			];

			const generated: GetTransactionsDtoList = {
				total_expenses: 100,
				total_incomes: 0,
				transactions: list,
			};

			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			jest.spyOn(service, 'getTransactionsBySearchQuery').mockResolvedValue(generated);

			await controller.getTransactionsBySearchQuery(mockRequest, mockResponse, 'query');

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(generated);
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.getTransactionsBySearchQuery(mockRequest, mockResponse, 'query');

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
	});
	describe('deleteTransaction()', () => {
		it('should return 200 with changed transaction id', async () => {
			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			const transaction: Transaction = {
				id: 100,
				amount: 100,
				type_id: 1,
				date: new Date(),
				description: '',
				category_id: 1,
				user_id: 1,
			};

			const dto: CreateCategoryDTO = {
				name: 'some category',
			};

			jest.spyOn(service, 'changeTransactionCategory').mockResolvedValue(transaction);

			await controller.changeTransactionCategory(mockRequest, mockResponse, dto, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: `Transaction changed with id: ${transaction.id}`,
			});
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.changeTransactionCategory(
				mockRequest,
				mockResponse,
				{} as CreateCategoryDTO,
				1,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
	});
	describe('deleteTransaction()', () => {
		it('should return 200 with deleted transaction id', async () => {
			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			const transaction: Transaction = {
				id: 100,
				amount: 100,
				type_id: 1,
				date: new Date(),
				description: '',
				category_id: 1,
				user_id: 1,
			};

			jest.spyOn(service, 'removeTransaction').mockResolvedValue(transaction);

			await controller.deleteTransaction(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: `Transaction removed with id: ${transaction.id}`,
			});
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.deleteTransaction(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
	});
	describe('ParseIntPipe()', () => {
		it('should return 400 argument is not a type of number', async () => {
			try {
				const pipe = new ParseIntPipe();

				const metadata: ArgumentMetadata = {
					type: 'param',
					metatype: Number,
					data: 'id',
				};

				await pipe.transform('abc', metadata);
			} catch (error: any) {
				expect(error instanceof BadRequestException).toBe(true);
				expect(error.message).toBe('Validation failed (numeric string is expected)');
			}
		});
	});
});
