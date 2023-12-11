import { Transaction, TransactionCategory, User } from '@prisma/client';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetTransactionDTO } from '../dto/transactions-get.dto';

@Injectable()
export class TransactionsMapper {
  constructor(private prisma: PrismaService) {}

  async mapTransactionListToJSONModelList(candidates: any[], user: any) {
    let total = 0;
    let type = '';

    const formatted: GetTransactionDTO[] = [];

    for (const tr of candidates) {
      total += tr.amount.toNumber();
      type = tr.type;

      const category = await this.prisma.transactionCategory.findUnique({ where: { id: tr.category_id } });
      const unit = this.mapTransactionToModel(tr, user, category, type);

      formatted.push(unit);
    }

    return { formatted, total };
  }

  mapTransactionToModel(tr: Transaction, u: User, cat: TransactionCategory, type: string): GetTransactionDTO {
    const model = new GetTransactionDTO();
    model.user = u.name;
    model.category = cat.name;
    model.amount = tr.amount;
    model.description = tr.description;
    model.date = tr.date.toLocaleString();
    model.type = type;
    return model;
  }
}
