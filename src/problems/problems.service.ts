import { Injectable } from '@nestjs/common';
import { CreateProblemDto } from './dto/create-problem.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async remove(id: string) {
    return await this.prisma.problem.delete ({
      where: {
        id: id,
      },
    });
  }
}
