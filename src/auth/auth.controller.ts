import { Controller, Post, Req, Res } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Response, Request } from 'express';
import { User } from '../users/user.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async registerNewUser(@Req() req: Request, @Res() res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const createdUser = await this.usersService.register(new User(name, email, password));
    return res.status(201).json({ status: 'OK', message: 'Successfully register new user', body: createdUser });
  }

  @Post('login')
  async loginUser(@Req() req: Request, @Res() res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const accessToken = await this.usersService.login(email, password);

    res.status(200).json(accessToken);
  }
}
