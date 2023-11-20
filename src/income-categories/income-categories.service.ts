import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IncomeCategoryDto } from './dto/income-category.dto';

@Injectable()
export class IncomeCategoriesService {
  constructor(private prisma: PrismaService) {}

  async addNewCategory(category: IncomeCategoryDto) {
    category.name = category.name.toUpperCase().trim();

    const candidate = await this.prisma.incomeCategory.findUnique({ where: { name: category.name } });

    if (candidate) {
      throw new HttpException('Income category already exists', 400);
    }

    console.log(`NAME: ${category.name}`);
    const createdCategory = await this.prisma.incomeCategory.create({
      data: {
        name: category.name,
      },
    });

    console.log(`create category ${createdCategory.id}`);

    return createdCategory;
  }

  async removeCategory(id: number) {
    const candidate = await this.prisma.incomeCategory.findUnique({ where: { id: id } });

    if (!candidate) {
      throw new HttpException('No objects found', 400);
    }

    const removed = await this.prisma.incomeCategory.delete({ where: { id: id } });

    console.log(`Remove category with id ${removed.id}`);

    return removed;
  }
}
