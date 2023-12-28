import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../utils/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let prisma: PrismaService;
  const jwtToken = 'jwtToken';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        PrismaService,
        JwtService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.cleanDatabase(prisma.user);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
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

      await authController.registerNewUser(mockRequest, mockResponse);

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

      await authController.registerNewUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled.',
        }),
      );
    });
  });

  describe('loginUser()', () => {
    it('should return access token', async () => {
      jest.spyOn(authService, 'login').mockImplementation(async () => {
        return { access_token: jwtToken };
      });

      const mockRequest = {
        body: {
          email: 'bobik1@gmail.com',
          password: 'abcd1234',
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse);

      await authController.loginUser(mockRequest, mockResponse);

      expect(authService.login).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ access_token: jwtToken });
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

      await authController.loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled.',
        }),
      );
    });
  });
});
