import { Test } from '@nestjs/testing';
import { TransactionCategoriesService } from './transaction-categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsCategoryDTO } from './dto/tr-category.dto';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user/user.model';
import { JwtService } from '@nestjs/jwt';

describe('TransactionCategoriesService', () => {
  let service: TransactionCategoriesService;
  let prisma: PrismaService;
  let authService: AuthService;
  const prismaMock: any = {
    transactionCategory: {
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TransactionCategoriesService, AuthService, JwtService, PrismaService],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    service = moduleRef.get(TransactionCategoriesService);
    authService = moduleRef.get(AuthService);
    await prisma.cleanDatabase(prisma.transactionCategory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNewCategory()', () => {
    it('should create new category', async () => {
      const categoryDTO: TransactionsCategoryDTO = {
        name: 'testcat',
      };

      jest.spyOn(service, 'ifCategoryExistsReturnsItsId').mockImplementationOnce(async () => {
        return 0;
      });

      const userDTOTemplate: User = {
        name: 'John',
        email: `john@mail.com + ${Math.random()}`,
        password: 'pass124',
      };

      const userFromService = await authService.register(userDTOTemplate);

      const user = {
        ...userFromService,
        sub: userFromService.id,
      };

      const createdCategory = await service.addNewCategory(categoryDTO, user);

      expect(createdCategory.name).toEqual('TESTCAT');
      expect(createdCategory.user_id).toEqual(user.sub);
    });
    it('should throw on category already exists', async () => {
      try {
        jest.spyOn(service, 'ifCategoryExistsReturnsItsId').mockImplementationOnce(async () => {
          return 1;
        });

        const categoryDTO: TransactionsCategoryDTO = {
          name: 'testcat',
        };

        const userDTOTemplate = {
          sub: 1,
          name: 'John',
          email: `john@mail.com + ${Math.random()}`,
          password: 'pass124',
        };

        await service.addNewCategory(categoryDTO, userDTOTemplate);
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });
  });

  describe('removeCategory()', () => {
    it('should remove category', async () => {
      jest.spyOn(service, 'ifCategoryExistsReturnsItsId').mockImplementationOnce(async () => {
        return 0;
      });

      const categoryDTO: TransactionsCategoryDTO = {
        name: 'category',
      };

      const userDTOTemplate: User = {
        name: 'John',
        email: `john@mail.com + ${Math.random()}`,
        password: 'pass124',
      };

      const userFromService = await authService.register(userDTOTemplate);

      const user = {
        ...userFromService,
        sub: userFromService.id,
      };

      const categoryToAdd = await service.addNewCategory(categoryDTO, user);

      const removedCategory = await service.removeCategory(categoryToAdd.id, user);

      expect(removedCategory.user_id).toEqual(user.sub);
      expect(removedCategory.name).toEqual('CATEGORY');
    });

    it('should throw on category not exists', async () => {
      try {
        const userDTOTemplate: User = {
          name: 'John',
          email: `john@mail.com + ${Math.random()}`,
          password: 'pass124',
        };

        const userFromService = await authService.register(userDTOTemplate);

        const user = {
          ...userFromService,
          sub: userFromService.id,
        };

        await service.removeCategory(1500, user);
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });
    it('should throw on access not allowed', async () => {
      try {
        const categoryDTO: TransactionsCategoryDTO = {
          name: 'category',
        };

        const userDTOTemplate: User = {
          name: 'John',
          email: `john@mail.com + ${Math.random()}`,
          password: 'pass124',
        };

        const userFromService = await authService.register(userDTOTemplate);

        const user = {
          ...userFromService,
          sub: userFromService.id,
        };

        const categoryToAdd = await service.addNewCategory(categoryDTO, user);

        await service.removeCategory(categoryToAdd.id, user);
      } catch (error) {
        expect(error.status).toBe(401);
      }
    });
  });

  describe('ifCategoryExistsReturnsItsId()', () => {
    it('should return existing category id', async () => {
      const exampleCategory = {
        id: 99,
        user_id: 100,
        name: 'hello',
      };

      const trService = new TransactionCategoriesService(prismaMock);

      const findManyMock = jest.spyOn(prismaMock.transactionCategory, 'findMany').mockResolvedValue([exampleCategory]);

      const result = await trService.getCategoriesByUserId(123);

      expect(result).toEqual([exampleCategory]);
      expect(findManyMock).toHaveBeenCalledWith({ where: { user_id: 123 } });
    });
    it('should return 0 if category not exists', async () => {
      const result = await service.ifCategoryExistsReturnsItsId('NOT_EXISTING_CATEGORY', 4);

      expect(result).toEqual(0);
    });
  });
});