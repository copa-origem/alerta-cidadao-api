import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, DefaultValuePipe, ParseIntPipe, Inject } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Problems')
@ApiBearerAuth()
@Controller('problems')
export class ProblemsController {
  constructor(
    private readonly problemsService: ProblemsService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  @EventPattern('problem_created')
  async handleProblemCreated(@Payload() data: any) {

    await new Promise(r => setTimeout(r, 2000));

  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new urban problem'})
  @ApiResponse({ status: 201, description: 'problem create with success.'})
  @ApiResponse({ status: 401, description: 'Unauthorized request'})
  @ApiResponse({ status: 403, description: 'Invalid token or not forneced'})
  async create(@Body() createProblemDto: CreateProblemDto, @Req() req) {
    const userId = req.user.id;
    const result = await this.problemsService.create(userId, createProblemDto);
    await this.cacheManager.clear();
    return result;
  }

  @Get('map')
  @ApiOperation({ summary: 'return the coords from all problems (light)'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  findAllForMap() {
    return this.problemsService.findAllForMap();
  }

  @Get()
  @ApiOperation({ summary: 'List all problems registed'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.problemsService.findAll(page, limit);
  }

  @Get('my-problems')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'List only the problems created by user'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  @ApiResponse({ status: 403, description: 'Invalid token or not forneced'})
  findUserProblems(@Req() req) {

    const userId = req.user.id;

    return this.problemsService.findUserProblems(userId);
  }
  @Patch(':id/solve')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'update the problem status'})
  @ApiResponse({ status: 200, description: 'status update with success.'})
  @ApiResponse({ status: 401, description: 'Unauthorized request'})
  @ApiResponse({ status: 403, description: 'Invalid token or not forneced'})
  async updateStatus(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const result = await this.problemsService.update(id, userId);
    await this.cacheManager.clear();
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete the problem by id'})
  @ApiResponse({ status: 200, description: 'Deleted the problem by id'})
  @ApiResponse({ status: 403, description: 'Invalid token or not forneced'})
  async remove(@Param('id') id: string, @Req() req) {
    const result = await this.problemsService.remove(id, req.user.id);
    await this.cacheManager.clear();
    return result;
  }
}
