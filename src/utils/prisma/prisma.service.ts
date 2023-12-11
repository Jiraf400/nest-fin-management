import { Prisma, PrismaClient } from '@prisma/client';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as process from 'process';
import { DefaultArgs } from 'prisma/prisma-client/runtime';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase(prisma: Prisma.UserDelegate<DefaultArgs>) {
    await prisma.deleteMany({ where: { id: { gte: 0 } } });
    console.log('db cleaned up');
  }
}
