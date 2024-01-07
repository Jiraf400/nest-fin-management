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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MonthlyLimitsService } from './monthly-limits.service';
import { Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { MonthlyLimitDTO } from './dto/mlimit.dto';

@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
@Controller('limits')
export class MonthlyLimitsController {
  constructor(private mLimitsService: MonthlyLimitsService) {}

  @Post()
  async addMonthLimit(@Req() req: Request, @Res() res: Response, @Body() mlDto: MonthlyLimitDTO) {
    const userFromRequest = req.body.user;

    if (!userFromRequest || !mlDto.limit_amount) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const created = await this.mLimitsService.addMonthLimit(mlDto, userFromRequest.sub);

    return res.status(201).json({ status: 'OK', message: 'Successfully set limit', body: created });
  }

  @Patch(':id')
  async changeMonthLimitAmount(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id', ParseIntPipe) limit_id: number,
    @Body() mlDto: MonthlyLimitDTO,
  ) {
    const userFromRequest = req.body.user;

    if (!userFromRequest || !mlDto.limit_amount) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const changed = await this.mLimitsService.changeLimitAmount(mlDto.limit_amount, userFromRequest.sub, limit_id);

    return res.status(200).json({ status: 'OK', message: 'Successfully update limit', body: changed });
  }

  @Delete(':id')
  async removeMonthLimit(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) limit_id: number) {
    const userFromRequest = req.body.user;

    if (!userFromRequest || !limit_id) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const deleteLimit = await this.mLimitsService.deleteMonthLimit(limit_id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: 'Successfully delete limit', body: deleteLimit });
  }
}
