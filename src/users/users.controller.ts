import { Controller, Post, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response, Request } from 'express';
import { User } from './user.model';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async registerNewUser(@Req() req: Request, @Res() res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const createdUser = await this.usersService.register(new User(name, email, password));
    return res.status(201).json({ status: 'OK', message: 'Successfully register new user', body: createdUser });
  }

  //login
}
