import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({summary: 'List all categories of urban problems on database'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':name')
  @ApiOperation({summary: 'List a category by name'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  findByName(@Param('name') name: string) {
    return this.categoriesService.findByName(name);
  }
}
