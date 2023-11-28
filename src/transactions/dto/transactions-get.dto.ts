import { Decimal } from 'prisma/prisma-client/runtime';

export class GetTransactionDTO {
  user: string;
  category: string;
  description: string;
  type: string;
  amount: Decimal;
  date: Date | string;
}
