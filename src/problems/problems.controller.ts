import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, Inject } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { User } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@ApiTags('Problems')
@Controller('problems')
export class ProblemsController {
  constructor(
    private readonly problemsService: ProblemsService,
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new urban problem'})
  @ApiResponse({ status: 201, description: 'Problem created successfully.'})
  @ApiResponse({ status: 401, description: 'Unauthorized request'})
  @ApiResponse({ status: 403, description: 'Invalid or missing token'})
  async create(@Body() createProblemDto: CreateProblemDto, @CurrentUser() user: User) {
    const result = await this.problemsService.create(user.id, createProblemDto);
    await this.cacheManager.clear();

    const mapPayload = {
      id: result.id,
      latitude: result.latitude,
      longitude: result.longitude,
      imageUrl: result.imageUrl,
      description: result.description,
      votesNotExistsCount: result.votesNotExistsCount,
      issueType: {
        id: result.issueType.id,
        title: result.issueType.title
      }
    }

    this.notificationsGateway.notifyAll('map-update', mapPayload);
    return result;
  }

  @Get('map')
  @ApiOperation({ summary: 'Return the coordinates of all open problems (lightweight)'})
  @ApiResponse({ status: 200, description: 'List returned successfully.'})
  findAllForMap() {
    return this.problemsService.findAllForMap();
  }

  @Get()
  @ApiOperation({ summary: 'List all registered problems'})
  @ApiResponse({ status: 200, description: 'List returned successfully.'})
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.problemsService.findAll(page, limit);
  }

  @Get('my-problems')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List only the problems created by the user'})
  @ApiResponse({ status: 200, description: 'List returned successfully.'})
  @ApiResponse({ status: 403, description: 'Invalid or missing token'})
  findUserProblems(@CurrentUser() user: User) {
    return this.problemsService.findUserProblems(user.id);
  }

  @Patch(':id/solve')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark the problem as solved'})
  @ApiResponse({ status: 200, description: 'Status updated successfully.'})
  @ApiResponse({ status: 401, description: 'Unauthorized request'})
  @ApiResponse({ status: 403, description: 'Invalid or missing token'})
  async markAsSolved(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.problemsService.markAsSolved(id, user.id);
    await this.cacheManager.clear();
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete the problem by id'})
  @ApiResponse({ status: 200, description: 'Deleted the problem by id'})
  @ApiResponse({ status: 403, description: 'Invalid or missing token'})
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.problemsService.remove(id, user.id);
    await this.cacheManager.clear();
    return result;
  }
}
