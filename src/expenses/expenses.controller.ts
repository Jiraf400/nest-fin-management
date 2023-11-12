import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDTO } from './dto/expenses.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('expenses')
@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
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

  @Delete(':id')
  async deleteExpense(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const deletedExpense = await this.expenseService.deleteExpense(id);

    return res.status(200).json({ status: 'OK', message: `Expense removed with id: ${deletedExpense.expense_id}` });
  }
}
