import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { ProblemsModule } from './problems/problems.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [PrismaModule, CategoriesModule, AuthModule, ProblemsModule, VotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
