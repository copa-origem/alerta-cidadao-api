import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateProblemDto } from './dto/create-problem.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProblemDto: CreateProblemDto) {
    return await this.prisma.problem.create({
      data: {
        description: createProblemDto.description,
        latitude: createProblemDto.latitude,
        longitude: createProblemDto.longitude,
        imageUrl: createProblemDto.imageUrl,

        issueType: {
          connect: { id: createProblemDto.issueTypeId }
        },
        author: {
          connect: { id: userId }
        }
      },
    });
  }

  async findAll() {
    return await this.prisma.problem.findMany ({
      include: {
        issueType: true,
        author: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} problem`;
  }

  async remove(id: string, userId: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new NotFoundException("Problem not found.")
    }

    if (problem.authorId !== userId) {
      throw new ForbiddenException('You dont have permition to delete this problem.')
    }

    return await this.prisma.problem.delete({
      where: { id },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronDeleteOldProblems() {

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.problem.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
      },
    });
  }
}
