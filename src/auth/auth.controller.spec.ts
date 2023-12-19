import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../utils/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [PrismaService, JwtService],
    }).compile();

    jwt = moduleRef.get(JwtService);
    prisma = moduleRef.get(PrismaService);
    authService = new AuthService(jwt, prisma);
    controller = new AuthController(authService);
    await prisma.cleanDatabase(prisma.user);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerNewUser', () => {
    it('should return a successful register response', async () => {
      const mockRequest = {
        body: {
          name: 'bobik1',
          email: 'bobik1@gmail.com',
          password: 'abcd1234',
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.registerNewUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          message: 'Successfully register new user',
        }),
      );
    });
    it('should return 400 on checking if all fields filled', async () => {
      const mockRequest = {
        body: {
          name: 'bobik1',
          password: 'abcd1234',
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.registerNewUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled.',
        }),
      );
    });
  });

  describe('loginUser()', () => {
    it('should return a successful login response', async () => {
      const mockRequest = {
        body: {
          email: 'bobik1@gmail.com',
          password: 'abcd1234',
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      //TODO write test to check if response body contain "access_token" string
    });
    it('should return 400 on checking if all fields filled', async () => {
      const mockRequest = {
        body: {
          email: 'bobik1@gmail.com',
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled.',
        }),
      );
    });
  });
});
