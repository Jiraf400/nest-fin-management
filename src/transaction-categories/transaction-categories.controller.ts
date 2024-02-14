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
} from '@nestjs/common';
import { TransactionCategory } from '@prisma/client';
import { Request, Response } from 'express';
import { UserFromToken } from 'src/utils/dtos/user-token.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { TransactionCategoriesService } from './transaction-categories.service';

@UseGuards(AuthGuard)
@Controller('categories')
export class TransactionCategoriesController {
	constructor(private readonly categoryService: TransactionCategoriesService) {}

	@Post()
	async createNewCategory(
		@Req() req: Request,
		@Res() res: Response,
		@Body() categoryDTO: CreateCategoryDTO,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const createdCategory: TransactionCategory = await this.categoryService.addNewCategory(
			categoryDTO,
			requestUser.id,
		);

		return res.status(201).json({
			status: 'OK',
			message: 'Successfully add new transaction category',
			body: createdCategory,
		});
	}

	@Delete(':id')
	async removeCategory(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', new ParseIntPipe()) id: number,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const removedCategory: TransactionCategory = await this.categoryService.removeCategory(
			id,
			requestUser.id,
		);

		return res.status(200).json({
			status: 'OK',
			message: `Transaction category removed with id: ${removedCategory.id}`,
		});
	}
}
