import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {

  //Dependence Injection
  constructor(private prisma: PrismaService) {}

  //method to get the categories and issueTypes
  async findAll() {
    return await this.prisma.category.findMany ({
      include: {
        issueTypes: true,
      },
    });
  }
}
