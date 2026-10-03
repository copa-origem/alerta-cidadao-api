import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { User } from '@prisma/client';

@ApiTags('Votes')
@ApiBearerAuth()
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new vote on a problem'})
  @ApiResponse({ status: 201, description: 'Vote created successfully.'})
  @ApiResponse({ status: 401, description: 'Unauthorized request'})
  @ApiResponse({ status: 400, description: 'problemId must be a UUID'})
  @ApiResponse({ status: 400, description: 'Type must be CONFIRMATION or NON_EXISTENT'})
  @ApiResponse({ status: 409, description: 'You already voted on this problem.'})
  create(@Body() createVoteDto: CreateVoteDto, @CurrentUser() user: User) {
    return this.votesService.create(user.id, createVoteDto);
  }
}
