import { Decimal } from 'prisma/prisma-client/runtime';

export class GetIncomeModel {
  user: string;
  category: string;
  amount: Decimal;
  date: Date | string;
}
