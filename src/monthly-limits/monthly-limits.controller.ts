import { Body, Controller, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
  async createTransaction(@Req() req: Request, @Res() res: Response, @Body() mlDto: MonthlyLimitDTO) {
    const userFromRequest = req.body.user;

    if (!userFromRequest || !mlDto) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const created = await this.mLimitsService.addNewMonthLimit(mlDto, userFromRequest);

    return res.status(201).json({ status: 'OK', message: 'Successfully set limit', body: created });
  }
}
