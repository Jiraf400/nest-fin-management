import { Decimal } from 'prisma/prisma-client/runtime';

export class GetExpenseModel {
  user: string;
  category: string;
  description: string;
  amount: Decimal;
  date: Date | string;
}
