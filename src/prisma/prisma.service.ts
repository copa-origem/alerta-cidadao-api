import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    
    // connect the database when the module start
    async OnModuleInit() {
        await this.$connect();
    }

    // disconnect when the application close
    async OnModuleDestroy() {
        await this.$disconnect();
    }
}
