import { HttpException, Injectable } from '@nestjs/common';
import { CategoryDTO } from './dto/category.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async addNewCategory(category: CategoryDTO) {
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
}
