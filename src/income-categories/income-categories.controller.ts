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
import { IncomeCategoriesService } from './income-categories.service';
import { Request, Response } from 'express';
import { IncomeCategoryDto } from './dto/income-category.dto';

@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
@Controller('incomes/categories')
export class IncomeCategoriesController {
  constructor(private incomeCategoryService: IncomeCategoriesService) {}

  @Post()
  async createNewCategory(@Req() req: Request, @Res() res: Response, @Body() categoryDTO: IncomeCategoryDto) {
    if (!categoryDTO) {
      return res.status(400).json({ message: 'Category not provided' });
    }

    const createdCategory = await this.incomeCategoryService.addNewCategory(categoryDTO);

    return res
      .status(201)
      .json({ status: 'OK', message: 'Successfully add new income category', body: createdCategory });
  }

  @Delete(':id')
  async removeCategory(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required.' });
    }

    const removedCategory = await this.incomeCategoryService.removeCategory(id);

    return res.status(200).json({ status: 'OK', message: `Income category removed with id: ${removedCategory.id}` });
  }
}
