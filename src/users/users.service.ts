import { Injectable, Req, Res } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: User) {
    if (!data || !data.name || !data.email || !data.password) {
      throw new Error();
    }

    const duplicate = await this.prisma.user.findUnique({ where: { email: String(data.email) } });

    if (duplicate) {
      throw new Error();
    }

    return this.prisma.user.create({ data });
  }

  //login
}
