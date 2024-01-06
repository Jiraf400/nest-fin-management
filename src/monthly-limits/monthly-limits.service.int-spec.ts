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
    await prisma.cleanDatabase(prisma.user);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNewMonthLimit()', () => {
    it('should create new monthly limit object', async () => {
      const userObj: User = {
        name: 'John',
        email: 'mlimittest1@mail.com',
        password: 'pass1234',
      };

      const mlimitDTO: MonthlyLimitDTO = {
        limit_amount: 1000,
      };

      const user = await authService.register(userObj);

      const limit = await service.addMonthLimit(mlimitDTO, user.id);

      expect(limit.user_id).toEqual(user.id);
      expect(limit.limit_amount).toEqual(1000);
    });
    it('should throw if monthly limit already set to user', async () => {
      try {
        const mlimitDTO: MonthlyLimitDTO = {
          limit_amount: 1000,
        };

        const user = <PrismaUser>await prisma.user.findUnique({ where: { email: 'mlimittest1@mail.com' } });

        await service.addMonthLimit(mlimitDTO, user.id);
        await service.addMonthLimit(mlimitDTO, user.id);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Monthly limit has already been set. Able only to delete or update amount');
      }
    });
  });
  describe('changeLimitAmount()', () => {
    it('should change monthly limit amount', async () => {
      const userObj: User = {
        name: 'John',
        email: 'mlimittest2@mail.com',
        password: 'pass1234',
      };

      const user = await authService.register(userObj);

      const mlimitDTO: MonthlyLimitDTO = {
        limit_amount: 1000,
      };

      const limit = await service.addMonthLimit(mlimitDTO, user.id);

      const changed = await service.changeLimitAmount(2000, user.id, limit.id);

      expect(changed.limit_amount).toEqual(2000);
      expect(changed.user_id).toEqual(user.id);
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
        const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: 'mlimittest2@mail.com' } });
        const limitFromDB = <MonthlyLimit>await prisma.monthlyLimit.findUnique({ where: { user_id: userFromDb.id } });

        await service.changeLimitAmount(2000, 123, limitFromDB.id);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Access not allowed');
      }
    });
  });
  describe('deleteExpenseLimit()', () => {
    it('should delete monthly limit object', async () => {
      const userObj: User = {
        name: 'John',
        email: 'mlimittest3@mail.com',
        password: 'pass1234',
      };

      const user = await authService.register(userObj);

      const mlimitDTO: MonthlyLimitDTO = {
        limit_amount: 1000,
      };

      const limit = await service.addMonthLimit(mlimitDTO, user.id);

      const deleted = await service.deleteMonthLimit(limit.id, user.id);

      expect(deleted.limit_amount).toEqual(1000);
      expect(deleted.user_id).toEqual(user.id);
    });
    it('should throw monthly limit object not found', async () => {
      try {
        const user = <PrismaUser>await prisma.user.findUnique({ where: { email: 'mlimittest3@mail.com' } });

        const mlimitDTO: MonthlyLimitDTO = {
          limit_amount: 1000,
        };

        await service.addMonthLimit(mlimitDTO, user.id);

        await service.deleteMonthLimit(5678, user.id);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No objects found');
      }
    });
    it('should throw on user ids mismatch', async () => {
      try {
        const userObj: User = {
          name: 'John',
          email: 'mlimittestX@mail.com',
          password: 'pass1234',
        };

        const user = await authService.register(userObj);

        const mlimitDTO: MonthlyLimitDTO = {
          limit_amount: 1000,
        };

        const limit = await service.addMonthLimit(mlimitDTO, user.id);

        await service.deleteMonthLimit(limit.id, 5678);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Access not allowed');
      }
    });
  });
  describe('addExpenseToLimitTotal()', () => {
    it('should add expense to monthly limit "total" field', async () => {
      const userObj: User = {
        name: 'John',
        email: 'mlimittest4@mail.com',
        password: 'pass1234',
      };

      const user = await authService.register(userObj);

      const mlimitDTO: MonthlyLimitDTO = {
        limit_amount: 5000,
      };

      await service.addMonthLimit(mlimitDTO, user.id);

      const updated = <MonthlyLimit>await service.addExpenseToLimitTotal(300, user.id);

      expect(updated.total_expenses).toEqual(300);
      expect(updated.user_id).toEqual(user.id);
    });
  });
  describe('removeExpenseFromLimitTotal()', () => {
    it('should remove expense amount from monthly limit', async () => {
      const userObj: User = {
        name: 'John',
        email: 'mlimittest5@mail.com',
        password: 'pass1234',
      };

      const user = await authService.register(userObj);

      const mlimitDTO: MonthlyLimitDTO = {
        limit_amount: 5000,
      };

      await service.addMonthLimit(mlimitDTO, user.id);

      <MonthlyLimit>await service.addExpenseToLimitTotal(2000, user.id);
      const updated = <MonthlyLimit>await service.removeExpenseFromLimitTotal(500, user.id);

      expect(updated.total_expenses).toEqual(1500);
      expect(updated.user_id).toEqual(user.id);
    });
  });
});
