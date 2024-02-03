import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
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
		it('should successfully create new transaction category', async () => {
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
		it('should throw on empty body', async () => {
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

			await controller.createNewCategory(mockRequest, mockResponse, {} as CreateCategoryDTO);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Category not provided',
				}),
			);
		});
	});

	describe('removeCategory()', () => {
		it('should successfully remove transaction category', async () => {
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
					name: 'blah blah blah',
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
		it('should throw on empty id or not integer id', async () => {
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

			await controller.removeCategory(mockRequest, mockResponse, 'abc' as unknown as number);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Id field required.',
				}),
			);
		});
	});
});
