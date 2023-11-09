import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: User) {
    const duplicate = await this.prisma.user.findUnique({ where: { email: String(data.email) } });

    if (duplicate) {
      throw new HttpException('User already exists', 400);
    }

    console.log(`Create user ${data.email}`);

    return this.prisma.user.create({ data });
  }

  async login(email: any, password: any) {
    const candidate = await this.prisma.user.findUnique({ where: { email: String(email) } });

    if (!candidate) {
      throw new HttpException('User not exists', 400);
    }

    if (password !== candidate.password) {
      throw new HttpException('Failed to match credentials', 400);
    }

    const payload = { email: email, sub: candidate.id };

    console.log(`Create token for user ${email}`);
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
