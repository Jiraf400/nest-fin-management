import { Test } from '@nestjs/testing';
import { TransactionCategoriesService } from './transaction-categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsCategoryDTO } from './dto/tr-category.dto';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../auth/user/user.model';
import { User as PrismaUser } from '@prisma/client';

describe('TransactionCategoriesService', () => {
  let service: TransactionCategoriesService;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TransactionCategoriesService, AuthService, JwtService, PrismaService],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    service = moduleRef.get(TransactionCategoriesService);
    authService = moduleRef.get(AuthService);
    await prisma.cleanDatabase(prisma.user);
    await prisma.cleanDatabase(prisma.transactionCategory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNewCategory()', () => {
    it('should create new category', async () => {
      const categoryDTO: TransactionsCategoryDTO = {
        name: 'test',
      };

      const userDTOTemplate: User = {
        name: 'John',
        email: `john@mail.com`,
        password: 'pass124',
      };

      const createdUser = await authService.register(userDTOTemplate);

      const createdCategory = await service.addNewCategory(categoryDTO, createdUser.id);

      expect(createdCategory.name).toEqual('TEST');
      expect(createdCategory.user_id).toEqual(createdUser.id);
    });
    it('should throw on category already exists', async () => {
      try {
        const categoryDTO: TransactionsCategoryDTO = {
          name: 'test',
        };

        const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: `john@mail.com` } });

        await service.addNewCategory(categoryDTO, userFromDb.id);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Category already exists');
      }
    });
  });

  describe('removeCategory()', () => {
    it('should remove category', async () => {
      const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: `john@mail.com` } });

      const createdCategory = await service.addNewCategory({ name: 'SOMECATEGORY' }, userFromDb.id);

      const removedCategory = await service.removeCategory(createdCategory.id, userFromDb.id);

      expect(removedCategory.user_id).toEqual(userFromDb.id);
      expect(removedCategory.name).toEqual('SOMECATEGORY');
    });
    it('should throw on category not exists', async () => {
      try {
        const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: `john@mail.com` } });

        await service.removeCategory(1500, userFromDb.id);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No objects found');
      }
    });
    it('should throw on access not allowed', async () => {
      try {
        const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: `john@mail.com` } });

        const createdCategory = await service.addNewCategory({ name: 'NEWCATEGORY' }, userFromDb.id);

        await service.removeCategory(createdCategory.id, 123321);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Access not allowed');
      }
    });
  });

  describe('ifCategoryExistsReturnsItsId()', () => {
    it('should return existing category id', async () => {
      const userFromDb = <PrismaUser>await prisma.user.findUnique({ where: { email: `john@mail.com` } });

      const createdCategory = await service.addNewCategory({ name: 'ANYNAME' }, userFromDb.id);

      const result = await service.ifCategoryExistsReturnsItsId(createdCategory.name, userFromDb.id);

      expect(result).toEqual(createdCategory.id);
    });
    it('should return 0 if category not exists', async () => {
      const result = await service.ifCategoryExistsReturnsItsId('NOT_EXISTING_CATEGORY', 4);

      expect(result).toEqual(0);
    });
  });
});
