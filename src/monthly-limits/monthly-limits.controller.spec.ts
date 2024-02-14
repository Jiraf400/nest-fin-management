import { ArgumentMetadata, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { MonthlyLimit } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyLimitsNotifications } from '../utils/notifications/monthly-limits.notifications';
import { MonthlyLimitDTO } from './dto/monthly-limit.dto';
import { MonthlyLimitsController } from './monthly-limits.controller';
import { MonthlyLimitsService } from './monthly-limits.service';

describe('MonthlyLimitsController', () => {
	let controller: MonthlyLimitsController;
	let service: MonthlyLimitsService;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [MonthlyLimitsController],
			providers: [MonthlyLimitsService, PrismaService, JwtService, MonthlyLimitsNotifications],
		}).compile();

		service = module.get(MonthlyLimitsService);
		controller = module.get(MonthlyLimitsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('addMonthLimit()', () => {
		it('should return 201 and created limit body', async () => {
			const monthlyLimit: MonthlyLimit = {
				id: 1,
				limit_amount: 100,
				total_expenses: 50,
				year: 2024,
				month: 1,
				user_id: 15,
			};

			jest.spyOn(service, 'addMonthLimit').mockResolvedValue(monthlyLimit);

			const limitDto: MonthlyLimitDTO = {
				limit_amount: 5000,
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

			await controller.addMonthLimit(mockRequest, mockResponse, limitDto);

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: 'Successfully set limit',
				body: monthlyLimit,
			});
		});
		it('should return 403 if user not provided', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.addMonthLimit(mockRequest, mockResponse, {} as MonthlyLimitDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
		it('should return 400 if dto is invalid', async () => {
			const limit: MonthlyLimitDTO = {
				limit_amount: -100,
			};

			const dtoCheck = plainToInstance(MonthlyLimitDTO, limit);
			const errors = await validate(dtoCheck);
			expect(errors.length).not.toBe(0);
		});
	});
	describe('changeMonthLimitAmount()', () => {
		it('should return 200 and changed limit body', async () => {
			const monthlyLimit: MonthlyLimit = {
				id: 1,
				limit_amount: 5000,
				total_expenses: 50,
				year: 2024,
				month: 1,
				user_id: 15,
			};

			jest.spyOn(service, 'changeLimitAmount').mockResolvedValue(monthlyLimit);

			const limitDto: MonthlyLimitDTO = {
				limit_amount: 5000,
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

			await controller.changeMonthLimitAmount(mockRequest, mockResponse, 1, limitDto);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: 'Successfully update limit',
				body: monthlyLimit,
			});
		});
		it('should return 403 if user not provided', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.changeMonthLimitAmount(mockRequest, mockResponse, 1, {} as MonthlyLimitDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
		it('should return 400 if dto is invalid', async () => {
			const limit: MonthlyLimitDTO = {} as MonthlyLimitDTO;

			const dtoCheck = plainToInstance(MonthlyLimitDTO, limit);
			const errors = await validate(dtoCheck);
			expect(errors.length).not.toBe(0);
		});
	});
	describe('ParseIntPipe()', () => {
		it('should return 400 if limit_id is not type of string', async () => {
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
	describe('removeMonthLimit()', () => {
		it('should return 200 and removed limit body', async () => {
			const monthlyLimit: MonthlyLimit = {
				id: 1,
				limit_amount: 5000,
				total_expenses: 50,
				year: 2024,
				month: 1,
				user_id: 15,
			};

			jest.spyOn(service, 'deleteMonthLimit').mockResolvedValue(monthlyLimit);

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

			await controller.removeMonthLimit(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: 'Successfully delete limit',
				body: monthlyLimit,
			});
		});
		it('should return 403 if user not provided', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.removeMonthLimit(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
	});
});
