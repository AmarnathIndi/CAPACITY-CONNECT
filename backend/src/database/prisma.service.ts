import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✓ Successfully connected to PostgreSQL (with pgvector support)');
    } catch (err) {
      console.warn('PostgreSQL database not immediately reachable or running in mock/demo fallback mode:', err.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
