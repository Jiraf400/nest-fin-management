import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwt: JwtService,
  ) {}

  async register(data: User) {
    const duplicate = await this.userService.checkIsUserExists(data.email);

    if (duplicate) {
      throw new HttpException('User already exists', 400);
    }

    data.password = await bcrypt.hash(data.password, 8);

    console.log(`Create user ${data.email}`);

    return this.userService.createNewUser(data);
  }

  async login(email: any, password: any) {
    const candidate = await this.userService.checkIsUserExists(email);

    if (!candidate) {
      throw new HttpException('User not exists', 400);
    }

    const match = await bcrypt.compare(password, candidate.password);

    if (!match) {
      throw new HttpException('Failed to match credentials', 400);
    }

    const payload = { email: email, sub: candidate.id };

    console.log(`Create token for user ${email}`);
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
}
