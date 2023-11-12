import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateExpenseDTO } from './dto/expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async createNewExpense(userFromRequest: any, expenseDto: CreateExpenseDTO) {
    const category = await this.prisma.expenseCategory.findUnique({ where: { name: expenseDto.category } });
    const user = await this.prisma.user.findUnique({ where: { id: userFromRequest.sub } });

    if (!category || !user) {
      throw new HttpException('Cannot find related tables with such parameters', 400);
    }

    expenseDto.date = new Date();

    const createdExpense = await this.prisma.expense.create({
      data: {
        amount: expenseDto.amount,
        description: expenseDto.description,
        category: {
          connect: { name: category.name },
        },
        user: {
          connect: { id: user.id },
        },
        date: expenseDto.date,
      },
    });

    console.log(`create expense ${createdExpense.expense_id}`);

    return createdExpense;
  }

  //delete expense
  //add new expense category
  //get expenses by month
  //set expense month limit
}
