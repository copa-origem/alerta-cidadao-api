import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.category.findMany ({
      include: {
        issueTypes: true,
      },
    });
  }

  async findByName(name: string) {
    return await this.prisma.category.findMany ({
      where: {
        name: name,
      },
      include: {
        issueTypes: true,
      },
    });
  }
}
