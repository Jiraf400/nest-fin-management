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
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategoryDto } from './dto/expense-category.dto';
import { Request, Response } from 'express';

@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
@Controller('expenses/categories')
export class ExpenseCategoriesController {
  constructor(private categoryService: ExpenseCategoriesService) {}

  @Post()
  async createNewCategory(@Req() req: Request, @Res() res: Response, @Body() categoryDTO: ExpenseCategoryDto) {
    if (!categoryDTO) {
      return res.status(400).json({ message: 'Category not provided' });
    }

    const createdCategory = await this.categoryService.addNewCategory(categoryDTO);

    return res
      .status(201)
      .json({ status: 'OK', message: 'Successfully add new expense category', body: createdCategory });
  }

  @Delete(':id')
  async removeCategory(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const removedCategory = await this.categoryService.removeCategory(id);

    return res.status(200).json({ status: 'OK', message: `Expense removed with id: ${removedCategory.id}` });
  }
}
