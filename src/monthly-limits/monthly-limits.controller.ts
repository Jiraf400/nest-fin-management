import {
	Body,
	Controller,
	Delete,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { MonthlyLimit } from '@prisma/client';
import { Request, Response } from 'express';
import { UserFromToken } from 'src/utils/dtos/user-token.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { MonthlyLimitDTO } from './dto/monthly-limit.dto';
import { MonthlyLimitsService } from './monthly-limits.service';

@UseGuards(AuthGuard)
@Controller('limits')
export class MonthlyLimitsController {
	constructor(private mLimitsService: MonthlyLimitsService) {}

	@Post()
	async addMonthLimit(
		@Req() req: Request,
		@Res() res: Response,
		@Body() limitDto: MonthlyLimitDTO,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const created: MonthlyLimit = await this.mLimitsService.addMonthLimit(limitDto, requestUser.id);

		return res.status(201).json({ status: 'OK', message: 'Successfully set limit', body: created });
	}

	@Patch(':id')
	async changeMonthLimitAmount(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', ParseIntPipe) limit_id: number,
		@Body() limitDto: MonthlyLimitDTO,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		if (!limit_id) {
			return res.status(400).json({ message: 'Cannot verify user info' });
		}

		const changed: MonthlyLimit = await this.mLimitsService.changeLimitAmount(
			limitDto.limit_amount,
			requestUser.id,
			limit_id,
		);

		return res.status(200).json({
			status: 'OK',
			message: 'Successfully update limit',
			body: changed,
		});
	}

	@Delete(':id')
	async removeMonthLimit(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', new ParseIntPipe()) limit_id: number,
	): Promise<Response> {
		const requestUser: UserFromToken = req.body.user;

		if (!requestUser) {
			return res.status(403).json({ message: 'Cannot verify user info' });
		}

		const deleteLimit: MonthlyLimit = await this.mLimitsService.deleteMonthLimit(
			limit_id,
			requestUser.id,
		);

		return res.status(200).json({
			status: 'OK',
			message: 'Successfully delete limit',
			body: deleteLimit,
		});
	}
}
