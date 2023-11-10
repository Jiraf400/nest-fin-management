import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from './user.model';
import { Account } from './account.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async ifUserExistsReturnsHisBody(email: string) {
    console.log('ifUserExistsReturnsHisBody called');
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  createNewUser(data: User) {
    return this.prisma.user.create({ data });
  }

  async createAccount(userId: any, cardNo: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const createdAccount = this.prisma.account.create({
      data: {
        cardNo: cardNo,
        userId: user.id,
      },
    });

    console.log(`account created ${createdAccount}`);

    return createdAccount;

    //find user by id
    //create account model
    //set account and user to each other
    //save user and account
  }
}
