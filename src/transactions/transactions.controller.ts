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
import { Transaction, User } from '@prisma/client';
import { Request, Response } from 'express';
import { UserFromToken } from 'src/utils/dtos/user-token.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CreateCategoryDTO } from '../transaction-categories/dto/create-category.dto';
import { TransactionsDto } from './dto/transactions.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UsePipes(ValidationPipe)
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

		if (!requestUser || !trDto) {
			return res.status(400).json({ message: 'All fields must be filled.' });
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

		timeRange = timeRange.toUpperCase().trim();

		if (!requestUser) {
			return res.status(400).json({ message: 'All fields must be filled' });
		}

		const transactions = await this.transactionService.getTransactionsByTimeRange(
			requestUser.id,
			timeRange,
		);

		return res.status(200).json(transactions);
	}

	@Get('find-by/category/:category')
	async getTransactionsByCategory(
		@Req() req: Request,
		@Res() res: Response,
		@Param('category') category: string,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		category = category.toUpperCase().trim();

		if (!requestUser) {
			return res.status(400).json({ message: 'All fields must be filled' });
		}

		const transactions = await this.transactionService.getTransactionsByCategory(
			requestUser.id,
			category,
		);

		return res.status(200).json(transactions);
	}

	@Get(':id')
	async getSingleTransaction(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', ParseIntPipe) id: number,
	) {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(400).json({ message: 'All fields must be filled' });
		}

		if (!id || !isFinite(id)) {
			return res.status(400).json({ message: 'Id field required.' });
		}

		const transaction = await this.transactionService.getSingleTransaction(id, requestUser.id);

		return res.status(200).json({ status: 'OK', message: 'Success', body: transaction });
	}

	@Patch(':id')
	async changeTransactionCategory(
		@Req() req: Request,
		@Res() res: Response,
		@Body() category: CreateCategoryDTO,
		@Param('id', ParseIntPipe) id: number,
	) {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(400).json({ message: 'All fields must be filled' });
		}

		if (!id || !category) {
			return res.status(400).json({ message: 'All fields must be filled.' });
		}

		const changed = await this.transactionService.changeTransactionCategory(
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
			return res.status(400).json({ message: 'All fields must be filled' });
		}

		if (!id || !isFinite(id)) {
			return res.status(400).json({ message: 'Id field required.' });
		}

		const deleted = await this.transactionService.removeTransaction(id, requestUser.id);

		return res.status(200).json({
			status: 'OK',
			message: `Transaction removed with id: ${deleted.id}`,
		});
	}
}
