import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TransactionCategory, User } from '@prisma/client';
import { UserRegisterDto } from 'src/auth/dtos/user-register.dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { TransactionCategoriesService } from './transaction-categories.service';

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
			const categoryDTO: CreateCategoryDTO = {
				name: 'test',
			};

			const userDTOTemplate: UserRegisterDto = {
				name: 'John',
				email: `john@mail.com`,
				password: 'pass124',
			};

			const createdUser: User = await authService.register(userDTOTemplate);

			const createdCategory: TransactionCategory = await service.addNewCategory(
				categoryDTO,
				createdUser.id,
			);

			expect(createdCategory.name).toEqual('TEST');
			expect(createdCategory.user_id).toEqual(createdUser.id);
		});
		it('should throw on category already exists', async () => {
			try {
				const categoryDTO: CreateCategoryDTO = {
					name: 'test',
				};

				const userFromDb: User = <User>await prisma.user.findUnique({
					where: { email: `john@mail.com` },
				});

				await service.addNewCategory(categoryDTO, (userFromDb as User).id);
			} catch (error) {
				expect(error.status).toBe(400);
				expect(error.message).toBe('Category already exists');
			}
		});
	});
	describe('removeCategory()', () => {
		it('should remove category', async () => {
			const userFromDb: User = <User>await prisma.user.findUnique({
				where: { email: `john@mail.com` },
			});

			const createdCategory: TransactionCategory = await service.addNewCategory(
				{ name: 'SOMECATEGORY' },
				(userFromDb as User).id,
			);

			const removedCategory: TransactionCategory = await service.removeCategory(
				createdCategory.id,
				(userFromDb as User).id,
			);

			expect(removedCategory.user_id).toEqual((userFromDb as User).id);
			expect(removedCategory.name).toEqual('SOMECATEGORY');
		});
		it('should throw on category not exists', async () => {
			try {
				const userFromDb: User = <User>await prisma.user.findUnique({
					where: { email: `john@mail.com` },
				});

				await service.removeCategory(1500, (userFromDb as User).id);
			} catch (error) {
				expect(error.status).toBe(400);
				expect(error.message).toBe('No objects found');
			}
		});
		it('should throw on access not allowed', async () => {
			try {
				const userFromDb: User = <User>await prisma.user.findUnique({
					where: { email: `john@mail.com` },
				});

				const createdCategory: TransactionCategory = await service.addNewCategory(
					{ name: 'NEWCATEGORY' },
					(userFromDb as User).id,
				);

				await service.removeCategory(createdCategory.id, 123321);
			} catch (error) {
				expect(error.status).toBe(403);
				expect(error.message).toBe('Access not allowed');
			}
		});
	});
	describe('ifCategoryExistsReturnsItsId()', () => {
		it('should return existing category id', async () => {
			const userFromDb: User = <User>await prisma.user.findUnique({
				where: { email: `john@mail.com` },
			});

			const createdCategory = await service.addNewCategory(
				{ name: 'ANYNAME' },
				(userFromDb as User).id,
			);

			const result: number = await service.ifCategoryExistsReturnsItsId(
				createdCategory.name,
				(userFromDb as User).id,
			);

			expect(result).toEqual(createdCategory.id);
		});
		it('should return 0 if category not exists', async () => {
			const result: number = await service.ifCategoryExistsReturnsItsId(
				'NOT_EXISTING_CATEGORY',
				500,
			);

			expect(result).toEqual(0);
		});
	});
});
