import { Test } from '@nestjs/testing';
import { MonthlyLimitsController } from './monthly-limits.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MonthlyLimitsService } from './monthly-limits.service';
import { Request, Response } from 'express';
import { MonthlyLimit } from '@prisma/client';
import { MonthlyLimitDTO } from './dto/mlimit.dto';
import { MonthlyLimitsNotifications } from './monthly-limits.notifications';

describe('MonthlyLimitsController', () => {
  let controller: MonthlyLimitsController;
  let service: MonthlyLimitsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [MonthlyLimitsController],
      providers: [MonthlyLimitsService, PrismaService, JwtService, MonthlyLimitsNotifications],
    }).compile();

    service = module.get(MonthlyLimitsService);
    controller = module.get(MonthlyLimitsController);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addMonthLimit()', () => {
    it('should return 201', async () => {
      const monthlyLimit: MonthlyLimit = {
        id: 1,
        limit_amount: 100,
        total_expenses: 50,
        year: 2024,
        month: 1,
        user_id: 15,
      };

      jest.spyOn(service, 'addMonthLimit').mockResolvedValue(monthlyLimit);

      const mlimitDto: MonthlyLimitDTO = {
        limit_amount: 5000,
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

      await controller.addMonthLimit(mockRequest, mockResponse, mlimitDto);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: 'Successfully set limit',
        body: monthlyLimit,
      });
    });
    it('should return 400 cus of unfilled fields', async () => {
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
    it('should return 200', async () => {
      const monthlyLimit: MonthlyLimit = {
        id: 1,
        limit_amount: 5000,
        total_expenses: 50,
        year: 2024,
        month: 1,
        user_id: 15,
      };

      jest.spyOn(service, 'changeLimitAmount').mockResolvedValue(monthlyLimit);

      const mlimitDto: MonthlyLimitDTO = {
        limit_amount: 5000,
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

      await controller.changeMonthLimitAmount(mockRequest, mockResponse, 1, mlimitDto);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: 'Successfully update limit',
        body: monthlyLimit,
      });
    });
    it('should return 400 cus of unfilled fields', async () => {
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
    it('should return 200', async () => {
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
            sub: 1,
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
    it('should return 400 cus of unfilled fields', async () => {
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
