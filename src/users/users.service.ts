import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async checkIsUserExists(email: string) {
    return this.prisma.user.findUnique({ where: { email: String(email) } });
  }

  createNewUser(data: User) {
    return this.prisma.user.create({ data });
  }
}
