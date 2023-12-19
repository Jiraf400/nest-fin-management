import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../utils/prisma/prisma.service';
import { User } from './user/user.model';
import * as process from 'process';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(data: User) {
    const duplicate = await this.prisma.user.findUnique({ where: { email: data.email } });

    if (duplicate) {
      throw new HttpException('User already exists', 400);
    }

    data.password = await bcrypt.hash(data.password, 8);

    const created = await this.prisma.user.create({ data });

    console.log(`Create user ${created.id}`);

    return created;
  }

  async login(email: any, password: any) {
    const candidate = await this.prisma.user.findUnique({ where: { email: email } });

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
      access_token: await this.jwt.signAsync(payload, { secret: `${process.env.JWT_SECRET}` }),
    };
  }
}

export function isEmailValid(email: any): boolean {
  const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  return expression.test(email);
}
