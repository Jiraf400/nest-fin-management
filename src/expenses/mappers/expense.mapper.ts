import { GetExpenseModel } from '../expenses.model';
import { Expense, ExpenseCategory, User } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpenseMapper {
  constructor(private prisma: PrismaService) {}

  async mapExpenseListToModel(candidates: any[], user: any) {
    let total = 0;
    const formatted: GetExpenseModel[] = [];

    for (const exp of candidates) {
      total += exp.amount.toNumber();

      const category = await this.prisma.expenseCategory.findUnique({ where: { id: exp.category_id } });
      const unit = this.mapExpenseToGetModel(exp, user, category);

      formatted.push(unit);
    }

    return { formatted, total };
  }

  mapExpenseToGetModel(exp: Expense, u: User, cat: ExpenseCategory): GetExpenseModel {
    const model = new GetExpenseModel();
    model.user = u.name;
    model.category = cat.name;
    model.amount = exp.amount;
    model.description = exp.description;
    model.date = exp.date.toLocaleString();
    return model;
  }
}
