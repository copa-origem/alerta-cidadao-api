import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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
