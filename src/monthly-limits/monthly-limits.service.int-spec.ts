import { Test } from '@nestjs/testing';
import { MonthlyLimitsService } from './monthly-limits.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyLimitsNotifications } from './monthly-limits.notifications';
import { User } from '../auth/user/user.model';
import { MonthlyLimitDTO } from './dto/mlimit.dto';
import { MonthlyLimit, User as PrismaUser } from '@prisma/client';

describe('MonthlyLimitsService', () => {
  let service: MonthlyLimitsService;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MonthlyLimitsService, MonthlyLimitsNotifications, PrismaService, AuthService, JwtService],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    service = moduleRef.get(MonthlyLimitsService);
    authService = moduleRef.get(AuthService);
    await prisma.cleanDatabase(prisma.monthlyLimit);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNewMonthLimit()', () => {
    it('should create new monthly limit object', async () => {
      await prisma.cleanDatabase(prisma.user);

      const userObj: User = {
        name: 'John',
        email: 'john@mail.com',
        password: 'pass1234',
      };

      const mlimitDTO: MonthlyLimitDTO = {
        limit_amount: 1000,
      };

      const user = await authService.register(userObj);

      const limit = await service.addNewMonthLimit(mlimitDTO, user.id);

      expect(limit.user_id).toEqual(user.id);
      expect(limit.limit_amount).toEqual(1000);
    });
    it('should throw if monthly limit already set to user', async () => {
      try {
        const userObj: User = {
          name: 'John',
          email: 'john2@mail.com',
          password: 'pass1234',
        };

        const mlimitDTO: MonthlyLimitDTO = {
          limit_amount: 1000,
        };

        const user = await authService.register(userObj);

        await service.addNewMonthLimit(mlimitDTO, user.id);
        await service.addNewMonthLimit(mlimitDTO, user.id);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Monthly limit has already been set. Able only to delete or update amount');
      }
    });
  });
  describe('changeLimitAmount()', () => {
    it('should change monthly limit amount', async () => {
      const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: 'john@mail.com' } });
      const limitFromDB = <MonthlyLimit>await prisma.monthlyLimit.findUnique({ where: { user_id: userFromDb.id } });

      const changed = await service.changeLimitAmount(2000, userFromDb.id, limitFromDB.id);

      expect(changed.limit_amount).toEqual(2000);
      expect(changed.user_id).toEqual(userFromDb.id);
    });
    it('should throw monthly limit object not found', async () => {
      try {
        await service.changeLimitAmount(2000, 123, 123);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Monthly limit object not found');
      }
    });
    it('should throw on user ids mismatch', async () => {
      try {
        const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: 'john@mail.com' } });
        const limitFromDB = <MonthlyLimit>await prisma.monthlyLimit.findUnique({ where: { user_id: userFromDb.id } });

        await service.changeLimitAmount(2000, 123, limitFromDB.id);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Access not allowed');
      }
    });
  });
  describe('deleteExpenseLimit()', () => {
    it('should delete monthly limit object', () => {});
    it('should throw monthly limit object not found', () => {});
    it('should throw on user ids mismatch', () => {});
  });
  describe('addExpenseToLimitTotal()', () => {
    it('should add expense to monthly limit "total" field', () => {});
  });
  describe('removeExpenseFromLimitTotal()', () => {
    it('should remove expense amount from monthly limit', () => {});
  });
  describe('ifLimitReachedSendAnEmail()', () => {});
});
