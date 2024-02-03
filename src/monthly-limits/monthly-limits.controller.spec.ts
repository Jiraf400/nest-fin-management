import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { MonthlyLimit } from '@prisma/client';
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
		it('should return 400 because of unfilled fields', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.addMonthLimit(mockRequest, mockResponse, {} as MonthlyLimitDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'All fields must be filled.',
			});
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
		it('should return 400 because ofsss unfilled fields', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.changeMonthLimitAmount(mockRequest, mockResponse, 1, {} as MonthlyLimitDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'All fields must be filled.',
			});
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
		it('should return 400 because of unfilled fields', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as unknown as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.removeMonthLimit(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'All fields must be filled.',
			});
		});
	});
});
