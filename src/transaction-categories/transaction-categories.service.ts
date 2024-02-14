import { HttpException, Injectable } from '@nestjs/common';
import { TransactionCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDTO } from './dto/create-category.dto';

@Injectable()
export class TransactionCategoriesService {
	constructor(private readonly prisma: PrismaService) {}

	async addNewCategory(category: CreateCategoryDTO, user_id: number): Promise<TransactionCategory> {
		category.name = this.formatCategoryName(category.name);

		const candidateId: number = await this.ifCategoryExistsReturnsItsId(category.name, user_id);

		if (candidateId !== 0) {
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
		const candidate: TransactionCategory = <TransactionCategory>(
			await this.prisma.transactionCategory.findUnique({
				where: { id: id },
			})
		);

		if (!candidate) {
			throw new HttpException('No objects found', 404);
		}

		if (candidate.user_id !== user_id) {
			throw new HttpException('Access not allowed', 403);
		}

		const removed: TransactionCategory = await this.prisma.transactionCategory.delete({
			where: { id: id },
		});

		console.log(`Remove category with id ${removed.id}`);

		return removed;
	}

	async ifCategoryExistsReturnsItsId(categoryName: string, user_id: number): Promise<number> {
		categoryName = this.formatCategoryName(categoryName);

		const userCategories: TransactionCategory[] = await this.getCategoriesByUserId(user_id);

		let candidateId = 0;

		userCategories.map(category => {
			if (category.name === categoryName) {
				candidateId = category.id;
			}
		});

		return candidateId;
	}

	async getCategoriesByUserId(user_id: number): Promise<TransactionCategory[]> {
		return await this.prisma.transactionCategory.findMany({
			where: { user_id: user_id },
		});
	}

	formatCategoryName(categoryName: string): string {
		return categoryName.toUpperCase().trim();
	}
}
