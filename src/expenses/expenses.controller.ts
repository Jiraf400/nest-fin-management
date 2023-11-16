import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { CategoryDTO } from '../categories/dto/category.dto';

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

  @Get('find-by/:timeRange')
  async getExpenseListByDay(@Req() req: Request, @Res() res: Response, @Param('timeRange') timeRange: string) {
    const userFromRequest = req.body.user;
    timeRange = timeRange.toUpperCase();

    const expenseList = await this.expenseService.getExpensesByTimeRange(userFromRequest.sub, timeRange);

    return res.status(200).json(expenseList);
  }

  @Get(':id')
  async getSingleExpense(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const receivedExpense = await this.expenseService.getSingleExpense(id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: 'Success', body: receivedExpense });
  }

  @Patch(':id')
  async changeExpenseCategory(
    @Req() req: Request,
    @Res() res: Response,
    @Body() category: CategoryDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userFromRequest = req.body.user;
    category.name = category.name.toUpperCase().trim();

    if (!id || !category) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const changedExpense = await this.expenseService.changeExpenseCategory(category.name, id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: `Expense changed with id: ${changedExpense.expense_id}` });
  }

  @Delete(':id')
  async deleteExpense(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const deletedExpense = await this.expenseService.deleteExpense(id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: `Expense removed with id: ${deletedExpense.expense_id}` });
  }
}
