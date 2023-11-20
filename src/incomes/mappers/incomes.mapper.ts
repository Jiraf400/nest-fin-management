import { IncomeCategory, Income, User } from '@prisma/client';
import { GetIncomeModel } from '../models/incomes.model';
import { PrismaService } from '../../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IncomesMapper {
  constructor(private prisma: PrismaService) {}

  mapIncomeToGetModel(inc: Income, u: User, cat: IncomeCategory): GetIncomeModel {
    const model = new GetIncomeModel();
    model.user = u.name;
    model.category = cat.name;
    model.amount = inc.amount;
    model.date = inc.date.toLocaleString();
    return model;
  }

  async mapIncomeListToModel(candidates: any[], user: any) {
    let total = 0;
    const formatted: GetIncomeModel[] = [];

    for (const inc of candidates) {
      total += inc.amount.toNumber();

      const category = await this.prisma.incomeCategory.findUnique({ where: { id: inc.category_id } });
      const unit = this.mapIncomeToGetModel(inc, user, category);

      formatted.push(unit);
    }

    return { formatted, total };
  }
}
