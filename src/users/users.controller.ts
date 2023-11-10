import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Request, Response } from 'express';
import { UsersService } from './users.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('account')
  async createUserAccount(@Req() req: Request, @Res() res: Response) {
    console.log(req.body);
    const { userId } = req.body.user;
    const { cardNo } = req.body();

    if (!userId || !cardNo) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const createdAccount = await this.userService.createAccount(userId, cardNo);
    return res.status(201).json({ status: 'OK', message: 'Successfully added new Account', body: createdAccount });
  }
}
