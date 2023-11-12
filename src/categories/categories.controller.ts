import { Body, Controller, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CategoriesService } from './categories.service';
import { CategoryDTO } from './dto/category.dto';
import { Request, Response } from 'express';

@UsePipes(ValidationPipe)
@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @Post()
  async createNewCategory(@Req() req: Request, @Res() res: Response, @Body() categoryDTO: CategoryDTO) {
    if (!categoryDTO) {
      return res.status(400).json({ message: 'Category not provided' });
    }

    const createdCategory = await this.categoryService.addNewCategory(categoryDTO);

    return res
      .status(201)
      .json({ status: 'OK', message: 'Successfully add new expense category', body: createdCategory });
  }
}
