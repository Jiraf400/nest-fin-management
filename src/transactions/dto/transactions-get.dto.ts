export class GetTransactionDTO {
  user: string;
  category: string;
  description: string;
  type: string;
  amount: number;
  date: Date | string;
}
