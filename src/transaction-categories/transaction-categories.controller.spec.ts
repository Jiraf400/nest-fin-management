import { ArgumentMetadata, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionCategoryDto } from './dto/category.dto';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { TransactionCategoriesController } from './transaction-categories.controller';
import { TransactionCategoriesService } from './transaction-categories.service';

describe('TransactionCategoriesController', () => {
	let controller: TransactionCategoriesController;
	let service: TransactionCategoriesService;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [TransactionCategoriesController],
			providers: [TransactionCategoriesService, PrismaService, JwtService],
		}).compile();

		service = module.get(TransactionCategoriesService);
		controller = module.get(TransactionCategoriesController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('createNewCategory()', () => {
		it('should return 201 and created transaction category body', async () => {
			const createdCategory: TransactionCategoryDto = {
				id: 1,
				name: 'PETS',
				user_id: 1,
			};

			const categoryDTO: CreateCategoryDTO = {
				name: 'PETS',
			};

			jest.spyOn(service, 'addNewCategory').mockResolvedValue(createdCategory);

			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.createNewCategory(mockRequest, mockResponse, categoryDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: 'Successfully add new transaction category',
				body: createdCategory,
			});
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.createNewCategory(mockRequest, mockResponse, {} as CreateCategoryDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
			});
		});
		it('should return 400 if dto is empty or invalid', async () => {
			const category: CreateCategoryDTO = {
				name: 'a',
			};

			const dtoCheck = plainToInstance(CreateCategoryDTO, category);
			const errors = await validate(dtoCheck);
			expect(errors.length).not.toBe(0);
		});
	});

	describe('removeCategory()', () => {
		it('should return 200 and remove transaction category id', async () => {
			const removedCategory: TransactionCategoryDto = {
				id: 1,
				name: 'PETS',
				user_id: 1,
			};

			jest.spyOn(service, 'removeCategory').mockResolvedValue(removedCategory);

			const mockRequest = {
				body: {
					user: {
						id: 1,
					},
				},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.removeCategory(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				status: 'OK',
				message: `Transaction category removed with id: ${removedCategory.id}`,
			});
		});
		it('should return 403 if user not specified', async () => {
			const mockRequest = {
				body: {},
			} as Request;

			const mockResponse = {} as Response;
			mockResponse.json = jest.fn();
			mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

			await controller.removeCategory(mockRequest, mockResponse, 1);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: 'Cannot verify user info',
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
	});
});
