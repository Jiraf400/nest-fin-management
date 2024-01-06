import { HttpException, Injectable } from '@nestjs/common';
import { TransactionsCategoryDTO } from './dto/tr-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionCategoriesService {
  constructor(private prisma: PrismaService) {}

  async addNewCategory(category: TransactionsCategoryDTO, user_id: number) {
    category.name = category.name.toUpperCase().trim();

    const candidateCategoryId = await this.ifCategoryExistsReturnsItsId(category.name, user_id);

    if (candidateCategoryId !== 0) {
      throw new HttpException('Category already exists', 400);
    }

    const createdCategory = await this.prisma.transactionCategory.create({
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

  async removeCategory(id: number, user_id: number) {
    const candidate = await this.prisma.transactionCategory.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user_id) {
      throw new HttpException('Access not allowed', 401);
    }

    const removed = await this.prisma.transactionCategory.delete({ where: { id: id } });

    console.log(`Remove category with id ${removed.id}`);

    return removed;
  }

  async ifCategoryExistsReturnsItsId(categoryName: string, user_id: number): Promise<number> {
    categoryName = categoryName.toUpperCase().trim();

    const categories = await this.getCategoriesByUserId(user_id);

    let candidateId = 0;

    categories.forEach(function (category) {
      if (category.name == categoryName) {
        candidateId = category.id;
      }
    });

    return candidateId;
  }

  getCategoriesByUserId(user_id: number) {
    return this.prisma.transactionCategory.findMany({ where: { user_id: user_id } });
  }
}
