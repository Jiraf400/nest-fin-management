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
import { AuthGuard } from '../auth/auth.guard';
import { CreateIncomeDto } from './dto/incomes.dto';
import { IncomesService } from './incomes.service';
import { IncomeCategoryDto } from '../income-categories/dto/income-category.dto';

@Controller('incomes')
@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
export class IncomesController {
  constructor(private incomeService: IncomesService) {}

  @Post()
  async addIncome(@Req() req: Request, @Res() res: Response, @Body() incomeDto: CreateIncomeDto) {
    const userFromRequest = req.body.user;

    if (!userFromRequest || !incomeDto) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const created = await this.incomeService.addNewIncome(userFromRequest, incomeDto);

    return res.status(201).json({ status: 'OK', message: 'Successfully add new income', body: created });
  }

  @Get('find-by/:timeRange')
  async getIncomeListByDay(@Req() req: Request, @Res() res: Response, @Param('timeRange') timeRange: string) {
    const userFromRequest = req.body.user;
    timeRange = timeRange.toUpperCase();

    const list = await this.incomeService.getIncomesByTimeRange(userFromRequest.sub, timeRange);

    return res.status(200).json(list);
  }

  @Get(':id')
  async getSingleIncome(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const received = await this.incomeService.getSingleIncome(id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: 'Success', body: received });
  }

  @Patch(':id')
  async changeIncomeCategory(
    @Req() req: Request,
    @Res() res: Response,
    @Body() category: IncomeCategoryDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userFromRequest = req.body.user;
    category.name = category.name.toUpperCase().trim();

    if (!id || !category) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const changed = await this.incomeService.changeIncomeCategory(category.name, id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: `Income changed with id: ${changed.id}` });
  }

  @Delete(':id')
  async removeIncome(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const deleted = await this.incomeService.deleteIncome(id, userFromRequest.sub);

    return res.status(200).json({ status: 'OK', message: `Income removed with id: ${deleted.id}` });
  }
}
