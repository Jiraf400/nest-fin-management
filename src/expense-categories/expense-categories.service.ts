import { HttpException, Injectable } from '@nestjs/common';
import { ExpenseCategoryDto } from './dto/expense-category.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private prisma: PrismaService) {}

  async addNewCategory(category: ExpenseCategoryDto) {
    category.name = category.name.toUpperCase().trim();

    const candidate = await this.prisma.expenseCategory.findUnique({ where: { name: category.name } });

    if (candidate) {
      throw new HttpException('Expense category already exists', 400);
    }

    console.log(`NAME: ${category.name}`);
    const createdCategory = await this.prisma.expenseCategory.create({
      data: {
        name: category.name,
      },
    });

    console.log(`create category ${createdCategory.id}`);

    return createdCategory;
  }

  async removeCategory(id: number) {
    const candidate = await this.prisma.expenseCategory.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    const removed = await this.prisma.expenseCategory.delete({ where: { id: id } });

    console.log(`Remove category with id ${removed.id}`);

    return removed;
  }
}
