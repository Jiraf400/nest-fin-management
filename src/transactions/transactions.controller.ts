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
import { AuthGuard } from '../auth/auth.guard';
import { Request, Response } from 'express';
import { TransactionsService } from './transactions.service';
import { TransactionsDto } from './dto/transactions.dto';
import { TransactionsCategoryDTO } from '../transaction-categories/dto/tr-category.dto';

@Controller('transactions')
@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Post()
  async createTransaction(@Req() req: Request, @Res() res: Response, @Body() trDto: TransactionsDto) {
    const userFromRequest = req.body.user;

    if (!userFromRequest || !trDto) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const created = await this.transactionService.addNewTransaction(userFromRequest, trDto);

    return res.status(201).json({ status: 'OK', message: 'Successfully add new transaction', body: created });
  }

  @Get('find-by/:timeRange')
  async getTransactionsByTimeRange(@Req() req: Request, @Res() res: Response, @Param('timeRange') timeRange: string) {
    const userFromRequest = req.body.user;
    timeRange = timeRange.toUpperCase();

    const transactions = await this.transactionService.getTransactionsByTimeRange(userFromRequest.sub, timeRange);

    return res.status(200).json(transactions);
  }

  @Get(':id')
  async getSingleTransaction(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const transaction = await this.transactionService.getSingleTransaction(id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: 'Success', body: transaction });
  }

  @Patch(':id')
  async changeTransactionCategory(
    @Req() req: Request,
    @Res() res: Response,
    @Body() category: TransactionsCategoryDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userFromRequest = req.body.user;
    category.name = category.name.toUpperCase().trim();

    if (!id || !category) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const changed = await this.transactionService.changeTransactionCategory(category.name, id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: `Transaction changed with id: ${changed.id}` });
  }

  @Delete(':id')
  async deleteTransaction(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const deleted = await this.transactionService.removeTransaction(id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: `Transaction removed with id: ${deleted.id}` });
  }
}
