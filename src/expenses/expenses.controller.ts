import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDTO } from './dto/expenses.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private expenseService: ExpensesService) {}

  @Post()
  async createExpense(@Req() req: Request, @Res() res: Response, @Body() expenseDto: CreateExpenseDTO) {
    const userFromRequest = req.body.user;

    //TODO add field validation
    //TODO add class-validator to expenseDTO

    const createdExpense = await this.expenseService.createNewExpense(userFromRequest, expenseDto);

    return res.status(201).json({ status: 'OK', message: 'Successfully add new expense', body: createdExpense });
  }
}
