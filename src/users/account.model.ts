import { Prisma } from '@prisma/client';
import { User } from './user.model';

export class Account implements Prisma.AccountCreateInput {
  constructor(cardNo: bigint | number, user: Prisma.UserCreateNestedOneWithoutAccountInput) {
    this.cardNo = cardNo;
    this.user = user;
  }

  cardNo: bigint | number;
  user: Prisma.UserCreateNestedOneWithoutAccountInput;
}
