import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @CacheTTL(3600 * 1000)
  @ApiOperation({summary: 'List all categories of urban problems on database'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':name')
  @ApiOperation({summary: 'List a category by name'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  @ApiParam({
    name: 'name',
    enum: ['Espaços Públicos', 'Infraestrutura Urbana', 'Mobilidade e Transporte', 'Saneamento e Meio Ambiente', 'Segurança e Cidadania'],
    description: 'Nome da categoria (ex: Espaços Públicos, Mobilidade e Transporte, etc.)'
  })
  findByName(@Param('name') name: string) {
    return this.categoriesService.findByName(name);
  }
}
