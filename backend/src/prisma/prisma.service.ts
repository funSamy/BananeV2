import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";
import * as path from 'path';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const dbPath = process.env.DATABASE_URL
      ? process.env.DATABASE_URL
      : `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;

    const adapter = new PrismaBunSqlite({ url: dbPath });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
