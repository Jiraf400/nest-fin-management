import { Test } from '@nestjs/testing';
import { TransactionCategoriesController } from './transaction-categories.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionCategoriesService } from './transaction-categories.service';
import { Request, Response } from 'express';

describe('TransactionCategoriesController', () => {
  let controller: TransactionCategoriesController;
  let service: TransactionCategoriesService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TransactionCategoriesController],
      providers: [TransactionCategoriesService, PrismaService, JwtService],
    }).compile();

    service = module.get(TransactionCategoriesService);
    controller = module.get(TransactionCategoriesController);
    prisma = module.get(PrismaService);
    // await prisma.cleanDatabase(prisma.transactionCategory);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewCategory()', () => {
    it('should successfully create new transaction category', async () => {
      const createdCategory = {
        id: 1,
        name: 'PETS',
        user_id: 1,
      };

      const categoryDTO = {
        name: 'PETS',
      };

      jest.spyOn(service, 'addNewCategory').mockResolvedValue(createdCategory);

      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
          name: 'PETS',
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.createNewCategory(mockRequest, mockResponse, categoryDTO);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: 'Successfully add new expense category',
        body: createdCategory,
      });
    });
    it('should throw on empty body', async () => {
      const categoryDTO = {
        name: '',
      };

      const mockRequest = {
        body: {
          name: '',
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.createNewCategory(mockRequest, mockResponse, categoryDTO);

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
      const removedCategory = {
        id: 1,
        name: 'PETS',
        user_id: 1,
      };

      jest.spyOn(service, 'removeCategory').mockResolvedValue(removedCategory);

      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
          name: 'blah blah blah',
        },
      } as unknown as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.removeCategory(mockRequest, mockResponse, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: `Expense category removed with id: ${removedCategory.id}`,
      });
    });
    it('should throw on empty id or not integer id', async () => {
      const mockRequest = {
        body: {
          name: 'blah blah blah',
        },
        query: {},
      } as unknown as Request;

      const mockResponse = {} as unknown as Response;
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
