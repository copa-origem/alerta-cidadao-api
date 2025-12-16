import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Problems')
@ApiBearerAuth()
@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new urban problem'})
  @ApiResponse({ status: 201, description: 'problem create with success.'})
  @ApiResponse({ status: 401, description: 'Unauthorized request'})
  @ApiResponse({ status: 403, description: 'Invalid token or not forneced'})
  create(@Body() createProblemDto: CreateProblemDto, @Req() req) {

    const userId = req.user.id;

    return this.problemsService.create(userId, createProblemDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all problems registed'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  findAll() {
    return this.problemsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'List only the problems created by user'})
  @ApiResponse({ status: 200, description: 'List returns with success.'})
  @ApiResponse({ status: 403, description: 'Invalid token or not forneced'})
  findUserProblems(@Req() req) {

    const userId = req.user.id;

    return this.problemsService.findUserProblems(userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete the problem by id'})
  @ApiResponse({ status: 200, description: 'Deleted the problem by id'})
  @ApiResponse({ status: 403, description: 'Invalid token or not forneced'})
  remove(@Param('id') id: string, @Req() req) {
    return this.problemsService.remove(id, req.user.id);
  }
}
