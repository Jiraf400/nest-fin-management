import { HttpException, Injectable } from '@nestjs/common';
import { TransactionCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDTO } from './dto/create-category.dto';

@Injectable()
export class TransactionCategoriesService {
	constructor(private readonly prisma: PrismaService) {}

	async addNewCategory(category: CreateCategoryDTO, user_id: number): Promise<TransactionCategory> {
		category.name = category.name.toUpperCase().trim();

		const candidateCategoryId: number = await this.ifCategoryExistsReturnsItsId(category.name, user_id);

		if (candidateCategoryId !== 0) {
			throw new HttpException('Category already exists', 400);
		}

		const createdCategory: TransactionCategory = await this.prisma.transactionCategory.create({
			data: {
				name: category.name,
				user: {
					connect: { id: user_id },
				},
			},
		});

		console.log(`create category ${createdCategory.id}`);

		return createdCategory;
	}

	async removeCategory(id: number, user_id: number): Promise<TransactionCategory> {
		const candidate: TransactionCategory | null = await this.prisma.transactionCategory.findUnique({
			where: { id: id },
		});

		if (!candidate) {
			throw new HttpException('No objects found', 400);
		}

		if (candidate.user_id !== user_id) {
			throw new HttpException('Access not allowed', 401);
		}

		const removed: TransactionCategory = await this.prisma.transactionCategory.delete({
			where: { id: id },
		});

		console.log(`Remove category with id ${removed.id}`);

		return removed;
	}

	async ifCategoryExistsReturnsItsId(categoryName: string, user_id: number): Promise<number> {
		categoryName = categoryName.toUpperCase().trim();

		const categories: TransactionCategory[] = await this.getCategoriesByUserId(user_id);

		let candidateId = 0;

		categories.forEach(function (category) {
			if (category.name == categoryName) {
				candidateId = category.id;
			}
		});

		return candidateId;
	}

	getCategoriesByUserId(user_id: number): Promise<TransactionCategory[]> {
		return this.prisma.transactionCategory.findMany({
			where: { user_id: user_id },
		});
	}
}
