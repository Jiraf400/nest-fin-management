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
import { AuthGuard } from '../auth/auth.guard';
import { TransactionCategoriesService } from './transaction-categories.service';
import { Request, Response } from 'express';
import { TransactionsCategoryDTO } from './dto/tr-category.dto';

@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
@Controller('categories')
export class TransactionCategoriesController {
  constructor(private categoryService: TransactionCategoriesService) {}

  @Post()
  async createNewCategory(@Req() req: Request, @Res() res: Response, @Body() categoryDTO: TransactionsCategoryDTO) {
    const userFromRequest = req.body.user;

    if (!categoryDTO) {
      return res.status(400).json({ message: 'Category not provided' });
    }

    const createdCategory = await this.categoryService.addNewCategory(categoryDTO, userFromRequest);

    return res
      .status(201)
      .json({ status: 'OK', message: 'Successfully add new expense category', body: createdCategory });
  }

  @Delete(':id')
  async removeCategory(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const removedCategory = await this.categoryService.removeCategory(id, userFromRequest);

    return res.status(200).json({ status: 'OK', message: `Expense category removed with id: ${removedCategory.id}` });
  }
}
