import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateProblemDto } from './dto/create-problem.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProblemsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  async create(userId: string, createProblemDto: CreateProblemDto) {
    let finalImageUrl = "";

    if (createProblemDto.imageUrl) {
      finalImageUrl = await this.cloudinary.uploadBase64(createProblemDto.imageUrl);
    }

    return await this.prisma.problem.create({
      data: {
        description: createProblemDto.description,
        latitude: createProblemDto.latitude,
        longitude: createProblemDto.longitude,
        imageUrl: finalImageUrl,

        issueType: {
          connect: { id: createProblemDto.issueTypeId }
        },
        author: {
          connect: { id: userId }
        }
      },
    });
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.problem.findMany({
        skip: skip,
        take: limit,
        include: {
          issueType: true,
        },
        orderBy: { createdAt: 'desc'}
      }),

      this.prisma.problem.count()
    ]);
    return {
      data: items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total/limit),
        limit
      }
    };
  }

  async findAllForMap() {
    return await this.prisma.problem.findMany({
      select: {
        id: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        description: true,
        votesNotExistsCount: true,
        issueType: {
          select: {
            id: true,
            title: true
          }
        }
      },
      where: {
        status: 'OPEN'
      }
    });
  }

  async findUserProblems(id: string) {
    return await this.prisma.problem.findMany ({
      where: {
        authorId: id
      },
      include: {
        issueType: true
      }
    });
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

  async update(id: string, userId: string) {
    const updateProblem = await this.prisma.problem.findUnique({
      where: {id: id, authorId: userId}
    });

    if (!updateProblem) {
      throw new NotFoundException("problem not found.");
    }

    return await this.prisma.problem.update({
      where: {id: id, authorId: userId},
      data: {
        status: "SOLVED"
      }
    })

  }
}
