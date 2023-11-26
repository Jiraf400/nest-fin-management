import { HttpException, Injectable } from '@nestjs/common';
import { ExpenseCategoryDto } from './dto/expense-category.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private prisma: PrismaService) {}

  async addNewCategory(category: ExpenseCategoryDto, user: any) {
    category.name = category.name.toUpperCase().trim();

    const candidateCategoryId = await this.ifCategoryExistsReturnsItsId(category.name, user.sub);

    console.log(`addNewCategory: ${candidateCategoryId}`);

    if (candidateCategoryId !== 0) {
      throw new HttpException('Category already exists', 400);
    }

    const createdCategory = await this.prisma.expenseCategory.create({
      data: {
        name: category.name,
        user: {
          connect: { id: user.sub },
        },
      },
    });

    console.log(`create category ${createdCategory.id}`);

    return createdCategory;
  }

  async removeCategory(id: number, user: any) {
    const candidate = await this.prisma.expenseCategory.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    if (candidate.user_id !== user.sub) {
      throw new HttpException('Access not allowed', 401);
    }

    const removed = await this.prisma.expenseCategory.delete({ where: { id: id } });

    console.log(`Remove category with id ${removed.id}`);

    return removed;
  }

  async ifCategoryExistsReturnsItsId(categoryName: string, user_id: number): Promise<number> {
    categoryName = categoryName.toUpperCase().trim();

    const candidates = await this.prisma.expenseCategory.findMany({ where: { user_id: user_id } });

    let candidateId = 0;

    candidates.forEach(function (candidate) {
      if (candidate.name == categoryName) {
        candidateId = candidate.id;
      }
    });

    return candidateId;
  }
}
