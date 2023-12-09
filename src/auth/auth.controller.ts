import { Controller, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { User } from './user/user.model';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerNewUser(@Req() req: Request, @Res() res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password || !isEmailValid(email)) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const createdUser = await this.authService.register(new User(name, email, password));
    return res.status(201).json({ status: 'OK', message: 'Successfully register new user', body: createdUser });
  }

  @Post('login')
  async loginUser(@Req() req: Request, @Res() res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const accessToken = await this.authService.login(email, password);

    res.status(200).json(accessToken);
  }
}

function isEmailValid(email: any) {
  const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  return expression.test(email);
}
