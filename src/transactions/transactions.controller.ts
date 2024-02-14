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
} from '@nestjs/common';
import { Transaction, User } from '@prisma/client';
import { Request, Response } from 'express';
import { UserFromToken } from 'src/utils/dtos/user-token.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CreateCategoryDTO } from '../transaction-categories/dto/create-category.dto';
import { GetTransactionsDtoList } from './dto/get-list-transactions.dto';
import { GetTransactionDTO } from './dto/transactions-get.dto';
import { TransactionsDto } from './dto/transactions.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
	constructor(private transactionService: TransactionsService) {}

	@Post()
	async createTransaction(
		@Req() req: Request,
		@Res() res: Response,
		@Body() trDto: TransactionsDto,
	): Promise<Response> {
		const requestUser: User = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const created: Transaction = await this.transactionService.addNewTransaction(
			requestUser.id,
			trDto,
		);

		return res.status(201).json({
			status: 'OK',
			message: 'Successfully add new transaction',
			body: created,
		});
	}

	@Get('find-by/timerange/:timeRange')
	async getTransactionsByTimeRange(
		@Req() req: Request,
		@Res() res: Response,
		@Param('timeRange') timeRange: string,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const transactions: GetTransactionsDtoList =
			await this.transactionService.getTransactionsByTimeRange(requestUser.id, timeRange);

		return res.status(200).json(transactions);
	}

	@Get('find-by/category/:category')
	async getTransactionsByCategory(
		@Req() req: Request,
		@Res() res: Response,
		@Param('category') category: string,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const transactions: GetTransactionsDtoList =
			await this.transactionService.getTransactionsByCategory(requestUser.id, category);

		return res.status(200).json(transactions);
	}

	@Get('find-by/query/:query')
	async getTransactionsBySearchQuery(
		@Req() req: Request,
		@Res() res: Response,
		@Param('query') query: string,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const transactions: GetTransactionsDtoList =
			await this.transactionService.getTransactionsBySearchQuery(requestUser.id, query);

		return res.status(200).json(transactions);
	}

	@Get(':id')
	async getSingleTransaction(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', new ParseIntPipe()) id: number,
	) {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const transaction: GetTransactionDTO = await this.transactionService.getSingleTransaction(
			id,
			requestUser.id,
		);

		return res.status(200).json({ status: 'OK', message: 'Success', body: transaction });
	}

	@Patch(':id')
	async changeTransactionCategory(
		@Req() req: Request,
		@Res() res: Response,
		@Body() category: CreateCategoryDTO,
		@Param('id', new ParseIntPipe()) id: number,
	) {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const changed: Transaction = await this.transactionService.changeTransactionCategory(
			category.name,
			id,
			requestUser.id,
		);

		return res.status(200).json({
			status: 'OK',
			message: `Transaction changed with id: ${changed.id}`,
		});
	}

	@Delete(':id')
	async deleteTransaction(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', ParseIntPipe) id: number,
	) {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const deleted: Transaction = await this.transactionService.removeTransaction(
			id,
			requestUser.id,
		);

		return res.status(200).json({
			status: 'OK',
			message: `Transaction removed with id: ${deleted.id}`,
		});
	}
}
