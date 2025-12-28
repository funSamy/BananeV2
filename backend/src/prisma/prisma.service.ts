import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../prisma/generated/prisma/client';
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

    super({
      adapter: new PrismaBetterSqlite3({
        url: dbPath,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
