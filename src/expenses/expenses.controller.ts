import { Body, Controller, Post, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDTO } from './dto/expenses.dto';

@Controller('expenses')
@UsePipes(ValidationPipe)
export class ExpensesController {
  constructor(private expenseService: ExpensesService) {}

  @Post()
  async createExpense(@Req() req: Request, @Res() res: Response, @Body() expenseDto: CreateExpenseDTO) {
    const userFromRequest = req.body.user;

    if (!userFromRequest || !expenseDto) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const createdExpense = await this.expenseService.createNewExpense(userFromRequest, expenseDto);

    return res.status(201).json({ status: 'OK', message: 'Successfully add new expense', body: createdExpense });
  }
}
