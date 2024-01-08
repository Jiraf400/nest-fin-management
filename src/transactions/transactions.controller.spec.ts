import { Test } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionsService } from './transactions.service';
import { TransactionsMapper } from './mappers/transactions.mapper';
import { Request, Response } from 'express';
import { TransactionsDto } from './dto/transactions.dto';
import { Transaction } from '@prisma/client';
import { MonthlyLimitsService } from '../monthly-limits/monthly-limits.service';
import { MonthlyLimitsNotifications } from '../monthly-limits/monthly-limits.notifications';
import { GetTransactionDTO } from './dto/transactions-get.dto';

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
            sub: 1,
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
    it('should return 400 if there are unfilled fields', async () => {
      const mockRequest = {
        body: {},
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.createTransaction(mockRequest, mockResponse, {} as TransactionsDto);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled.',
        }),
      );
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

      const generated = {
        total_expenses: 100,
        total_incomes: 0,
        list,
      };

      const mockRequest = {
        body: {
          user: {
            sub: 1,
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
    it('should return 400 if time range is wrong', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getTransactionsByTimeRange(mockRequest, mockResponse, 'banana');

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Parameters allowed: day, week, month',
        }),
      );
    });
    it('should return 400 if user from body not specified', async () => {
      const mockRequest = {
        body: {},
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getTransactionsByTimeRange(mockRequest, mockResponse, 'any');

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled',
        }),
      );
    });
  });
  describe('getSingleTransaction()', () => {
    it('should return 200 with one transaction body', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      const transaction: GetTransactionDTO = {
        amount: 100,
        type: 'Hello',
        date: new Date(),
        description: '',
        category: 'cats',
        user: 'John',
      };

      jest.spyOn(service, 'getSingleTransaction').mockResolvedValue(transaction);

      await controller.getSingleTransaction(mockRequest, mockResponse, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: 'Success',
        body: transaction,
      });
    });
    it('should return 400 if id not specified or not a number', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getSingleTransaction(mockRequest, mockResponse, 'abc' as unknown as number);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Id field required.',
      });
    });
    it('should return 400 if user from body not specified', async () => {
      const mockRequest = {
        body: {},
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getSingleTransaction(mockRequest, mockResponse, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All fields must be filled',
      });
    });
  });
  describe('deleteTransaction()', () => {
    it('should return 200 with deleted transaction id', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
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
    it('should return 400 if id not specified or not a number', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getSingleTransaction(mockRequest, mockResponse, '' as unknown as number);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Id field required.',
      });
    });
    it('should return 400 if user from body not specified', async () => {
      const mockRequest = {
        body: {},
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.deleteTransaction(mockRequest, mockResponse, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'All fields must be filled',
      });
    });
  });
});
